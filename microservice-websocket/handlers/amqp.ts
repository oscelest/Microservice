import Product from "../../microservice-shared/typescript/entities/Product";
import Environmental from "../../microservice-shared/typescript/services/Environmental";
import IMSC from "../../microservice-shared/typescript/typings/IMSC";

const AMQPMethods: Pick<IMSC.AMQP.MessageMethods, "websocket"> = {
  websocket: {
    async product_update(product_id: string) {
      const product = await Environmental.db_manager.findOne(Product, {where: {id: product_id}});
      Environmental.ws_server.emit("product_update", product.toJSON());
    },
  },
};

export default AMQPMethods;
