import AMQP from "amqplib";
import Promise from "bluebird";
import path from "path";
import "reflect-metadata";
import SocketIO from "socket.io";
import * as TypeORM from "typeorm";
import Endpoint from "../microservice-shared/typescript/services/Endpoint";
import Response from "../microservice-shared/typescript/services/Response";
import Environmental from "../microservice-shared/typescript/services/Environmental";
import IMSC from "../microservice-shared/typescript/typings/IMSC";
import AMQPMethods from "./handlers/amqp";
import WebsocketMethods from "./handlers/websocket";

Promise.props({
  mq: Environmental.Connect(() => Promise.resolve(AMQP.connect(process.env.MQ_HOST))),
  db: Environmental.Connect(() => Promise.resolve(TypeORM.createConnection({
    type:     "mysql",
    host:     process.env.DB_HOST,
    port:     +process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [path.resolve(__dirname, "../microservice-shared/typescript/entities/**.js")],
  }))),
})
.then(async dependencies => {
  Endpoint.publish();
  
  Object.assign(Environmental, {
    mq_channel:    await dependencies.mq.createChannel(),
    ws_server:     SocketIO(Endpoint.server),
    db_connection: dependencies.db,
    db_manager:    dependencies.db.manager,
  });
  
  await Environmental.mq_channel.assertQueue("websocket");
  
  await Environmental.mq_channel.consume("websocket", async message => {
    try {
      const request: IMSC.AMQPMessage<IMSC.WS.WebsocketMessage> = JSON.parse(message.content.toString());
      console.log("[WS] Message consumed", request);
      AMQPMethods[request.method].apply(null, request.parameters);
    }
    catch (e) {
      console.log(e);
    }
    Environmental.mq_channel.ack(message);
  });
  
  Environmental.ws_server.on("connection", socket => {
    socket.use((packet: [string, IMSC.WSMessage<IMSC.WS.MessageMethods[keyof IMSC.WS.MessageMethods]>, any], next) => {
      try {
        console.log("[WS] Packet received", packet[1]);
        WebsocketMethods[packet[1].method].apply(packet[1], packet[1].parameters);
        next();
      }
      catch (e) {
        socket.emit("exception", new Response(Response.Code.BadRequest, e));
        next();
      }
    });
  });
  console.log("[WS] Microservice online.");
})
.catch(err => console.error(err));

