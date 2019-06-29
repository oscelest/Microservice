import AMQP from "amqplib";
import Promise from "bluebird";
import path from "path";
import "reflect-metadata";
import * as TypeORM from "typeorm";
import Directory from "../microservice-shared/typescript/services/Directory";
import Endpoint from "../microservice-shared/typescript/services/Endpoint";
import Environmental from "../microservice-shared/typescript/services/Environmental";

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
  
  await new Directory(path.resolve(__dirname, "handlers/api.js")).require();
  Endpoint.setURLParameter("uuid", 0, (request, response: Endpoint.Response<Endpoint.UUIDLocals>, next, id: string) => {
    response.locals.params.id = id;
    next();
  });
  Endpoint.publish();
  
  Object.assign(Environmental, {
    db_connection: dependencies.db,
    db_manager:    dependencies.db.manager,
  });
  
  await Environmental.mq_channel.assertQueue("websocket");
  
  console.log("[Product] Microservice online.");
})
.catch(err => console.error(err));

