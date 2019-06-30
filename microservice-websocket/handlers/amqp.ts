import Product from "../../microservice-shared/typescript/entities/Product";
import Environmental from "../../microservice-shared/typescript/services/Environmental";
import IMSC from "../../microservice-shared/typescript/typings/IMSC";
import uuid from "uuid";

const AMQPMethods: IMSC.AMQP.WebsocketMessage = {
  async product_create(product_id: string) {
    const product = await Environmental.db_manager.findOne(Product, {where: {id: product_id}});
    Environmental.ws_server.emit("message", {id: uuid.v4(), method: "product_create", parameters: [product.toJSON()]} as IMSC.WSMessage<IMSC.WS.FrontendMessage>);
  },
  async product_update(product_id: string) {
    const product = await Environmental.db_manager.findOne(Product, {where: {id: product_id}});
    Environmental.ws_server.emit("message", {id: uuid.v4(), method: "product_update", parameters: [product.toJSON()]} as IMSC.WSMessage<IMSC.WS.FrontendMessage>);
  },
  async product_delete(product_id: string) {
    Environmental.ws_server.emit("message", {id: uuid.v4(), method: "product_delete", parameters: [product_id]} as IMSC.WSMessage<IMSC.WS.FrontendMessage>);
  },
};

export default AMQPMethods;
