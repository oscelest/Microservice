import IMSC from "../../microservice-shared/typescript/typings/IMSC";

const AMQPMethods: Pick<IMSC.AMQP.MessageMethods, "mail"> = {
  
  mail: {
    send(type: string, recipient: string) {
      console.log(type, recipient)
    }
  },
  
};

export default AMQPMethods;
