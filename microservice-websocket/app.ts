import AMQP from "amqplib";
import Promise from "bluebird";
import path from "path";
import "reflect-metadata";
import SocketIO from "socket.io";
import * as TypeORM from "typeorm";
import Endpoint from "../microservice-shared/typescript/services/Endpoint";
import Environmental from "../microservice-shared/typescript/services/Environmental";
import Response from "../microservice-shared/typescript/services/Response";
import IMSC from "../microservice-shared/typescript/typings/IMSC";
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
    entities: [path.resolve(__dirname, "../microservice-shared/typescript/entities/**/*.Entity.js")],
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
  
  await Environmental.mq_channel.assertQueue("basket");
  await Environmental.mq_channel.assertQueue("websocket");
  
  await Environmental.mq_channel.consume("websocket", async message => {
    try {
      const request: IMSC.Message<IMSC.AMQP.MessageMethods[keyof IMSC.AMQP.MessageMethods]> = JSON.parse(message.content.toString());
      console.log("[WS] Message consumed", request);
      // const method = AMQPMethods[request.target][request.method] as Function;
      // const response: IMSC.Message<any> = await method.apply(null, request.parameters);
      //
      // Environmental.ws_server.of("/").sockets[request.socket].emit(request.source, response);
    }
    catch (e) {
      console.log(e);
    }
    Environmental.mq_channel.ack(message);
  });
  
  Environmental.ws_server.on("connection", socket => {
    socket.use((packet: [string, IMSC.Message<IMSC.WS.MessageMethods[keyof IMSC.WS.MessageMethods]>, any], next) => {
      try {
        console.log("[WS] Packet received", packet[1]);
        
        const request = packet[1];
        const method = WebsocketMethods[request.target][request.method] as Function;
        const response: IMSC.Message<any> = method.apply(null, request.parameters);
        
        if (response.target === "frontend") {
          socket.emit("message", response);
        }
        else {
          WebsocketMethods.requests[request.id] = {
            message: request,
            socket: socket.id,
            timeout: setTimeout(() => {
              socket.emit("exception", {code: 504, message: WebsocketMethods.requests[request.id].message});
              delete WebsocketMethods.requests[request.id].message;
            }, 5000),
          };
          Object.assign(response, {id: request.id});
          Environmental.mq_channel.sendToQueue(response.target, Buffer.from(JSON.stringify(response)));
        }
        next();
      }
      catch (e) {
        socket.emit("error", new Response(200, e));
        next();
      }
    });
  });
  console.log("[WS] Microservice online.");
})
.catch(err => console.error(err));

