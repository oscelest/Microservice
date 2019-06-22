import IMSC from "../../microservice-shared/typescript/typings/IMSC";

const AMQPMethods: Pick<IMSC.AMQP.MessageMethods, "websocket" | "frontend"> = {
  websocket: {},
  frontend:  {},
};

export default AMQPMethods;
