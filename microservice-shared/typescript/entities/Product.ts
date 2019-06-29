import * as TypeORM from "typeorm";
import Endpoint from "../services/Endpoint";
import Entity from "../services/Entity";
import Environmental from "../services/Environmental";
import Exception from "../services/Exception";
import Response from "../services/Response";
import IMSC from "../typings/IMSC";
import BasketProduct from "./BasketProduct";
import uuid from "uuid";

@TypeORM.Entity()
@TypeORM.Unique("key", ["key"])
class Product extends Entity {
  
  @TypeORM.PrimaryGeneratedColumn("uuid")
  public readonly id: string;
  
  @TypeORM.Column({length: 128})
  public key: string;
  
  @TypeORM.Column({length: 255})
  public title: string;
  
  @TypeORM.Column({type: "text"})
  public description: string;
  
  @TypeORM.Column({type: "text"})
  public image: string;
  
  @TypeORM.Column({type: "int"})
  public price: number;
  
  @TypeORM.Column({type: "int"})
  public stock: number;
  
  @TypeORM.CreateDateColumn()
  public readonly time_created: Date;
  
  @TypeORM.UpdateDateColumn()
  public readonly time_updated: Date;
  
  /* Relations */
  
  @TypeORM.OneToMany(type => BasketProduct, basket_product => basket_product.product, {eager: false, nullable: false})
  baskets: BasketProduct[];
  
  public static async find(request: Endpoint.Request<Endpoint.FindQuery, object>, response: Endpoint.Response<object>): Promise<void> {
    try {
      new Response(Response.Code.OK, (await Environmental.db_manager.find(this, Endpoint.parseFindQueryOptions(request.query))).map(v => v.toJSON())).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in find method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async findById(request: Endpoint.Request<object, object>, response: Endpoint.Response<Endpoint.UUIDLocals>): Promise<void> {
    try {
      const entity = await Environmental.db_manager.findOne(this, {where: {id: response.locals.params.id}});
      if (!entity) return new Response(Response.Code.NotFound, {id: response.locals.params.id}).Complete(response);
      new Response(Response.Code.OK, entity.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in findById method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async create(request: Endpoint.Request<object, Product.CreateRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      if (await Environmental.db_manager.findOne(this, {where: {key: request.body.key}})) return new Response(Response.Code.Conflict, request.body).Complete(response);
      const product = new this();
      product.key = request.body.key;
      product.title = request.body.title;
      product.description = request.body.description;
      product.image = request.body.image;
      product.stock = request.body.stock;
      product.price = request.body.price;
      await Environmental.db_manager.save(product);
      new Response(Response.Code.OK, product.toJSON()).Complete(response);
    }
    catch (e) {
      console.log(e);
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in create method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async update(request: Endpoint.Request<object, Product.UpdateRequestBody>, response: Endpoint.Response<Endpoint.UUIDLocals>): Promise<void> {
    try {
      const product = await Environmental.db_manager.findOne(this, {where: {id: response.locals.params.id}});
      if (!product) return new Response(Response.Code.NotFound, request.body).Complete(response);

      if (product.key) product.key = request.body.key;
      if (product.title) product.title = request.body.title;
      if (product.description) product.description = request.body.description;
      if (product.image) product.image = request.body.image;
      if (product.stock) product.stock = request.body.stock;
      if (product.price) product.price = request.body.price;
      
      const message: IMSC.AMQPMessage<IMSC.AMQP.WebsocketMessage> = {method: "product_update", parameters: [product.id], source: "product", target: "websocket", id: uuid.v4()};
      Environmental.mq_channel.sendToQueue("mail", Buffer.from(JSON.stringify(message)));
      
      new Response(Response.Code.OK, (await Environmental.db_manager.save(product)).toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in update method on ${this.name} entity.`, e)).Complete(response);
    }
    
  }
  
}

namespace Product {
  
  export type CreateRequestBody = {
    key: string
    title: string
    image: string
    description: string
    price: number
    stock: number
  }
  
  export type UpdateRequestBody = {
    key: string
    title: string
    image: string
    description: string
    price: number
    stock: number
  }
  
}

export default Product;
