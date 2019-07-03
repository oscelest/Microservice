import Checkout from "../../microservice-shared/typescript/entities/Checkout";
import Environmental from "../../microservice-shared/typescript/services/Environmental";
import IMSC from "../../microservice-shared/typescript/typings/IMSC";

const AMQPMethods: IMSC.AMQP.MailMessage = {
  
  async send(this: IMSC.AMQPMessage<IMSC.AMQP.MailMessage>, type: string, checkout: string) {
    const entity = await Environmental.db_manager.findOne(Checkout, {where: {id: checkout}});
    console.log(`Sending '${type}' to ${entity.user.email}.`);
  },
  
};

export default AMQPMethods;
