import AMQP from "amqplib";
import Promise from "bluebird";
import path from "path";
import "reflect-metadata";
import * as TypeORM from "typeorm";
import Directory from "../microservice-shared/typescript/services/Directory";
import Endpoint from "../microservice-shared/typescript/services/Endpoint";
import Environmental from "../microservice-shared/typescript/services/Environmental";
import IMSC from "../microservice-shared/typescript/typings/IMSC";

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
  
  Endpoint.setURLParameter("uuid", 0, (request, response: Endpoint.Response<Endpoint.UUIDLocals>, next, id: string) => {
    response.locals.params.id = id;
    next();
  });
  await new Directory(path.resolve(__dirname, "handlers/api.js")).require();
  Endpoint.publish();
  
  Object.assign(Environmental, {
    mq_channel:    await dependencies.mq.createChannel(),
    db_connection: dependencies.db,
    db_manager:    dependencies.db.manager,
  });
  
  await Environmental.mq_channel.assertQueue("basket");
  await Environmental.mq_channel.assertQueue("websocket");
  await Environmental.mq_channel.consume("basket", async message => {
    try {
      const request: IMSC.Message<IMSC.AMQP.MessageMethods[keyof IMSC.AMQP.MessageMethods]> = JSON.parse(message.content.toString());
      console.log("[Basket] Message consumed", request);
      
      // const response: iAMQP.Message<any> = await AMQPMethods[request.target][request.method].apply(null, request.parameters);
      // Environmental.mq_channel.sendToQueue(response.target, Buffer.from(JSON.stringify(response)));
    }
    catch (e) {
      console.log(e);
    }
    Environmental.mq_channel.ack(message);
  });
  
  console.log("[Basket] Microservice online.");
})
.catch(err => console.error(err));

