import AMQP from "amqplib";
import Promise from "bluebird";
import path from "path";
import "reflect-metadata";
import * as TypeORM from "typeorm";
import Endpoint from "../microservice-shared/typescript/services/Endpoint";
import Environmental from "../microservice-shared/typescript/services/Environmental";
import IMSC from "../microservice-shared/typescript/typings/IMSC";
import AMQPMethods from "./handlers/amqp";

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
    db_connection: dependencies.db,
    db_manager:    dependencies.db.manager,
  });
  
  await Environmental.mq_channel.assertQueue("mail");
  await Environmental.mq_channel.consume("mail", async message => {
    try {
      const request: IMSC.AMQPMessage<IMSC.AMQP.MailMessage> = JSON.parse(message.content.toString());
      // console.log("[Mail] Message consumed", request);
      (AMQPMethods[request.method] as Function).apply(request, request.parameters);
    }
    catch (e) {
      console.log(e);
    }
    Environmental.mq_channel.ack(message);
  });
  
  console.log("[Mail] Microservice online.");
})
.catch(err => console.error(err));

