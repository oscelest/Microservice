import * as TypeORM from "typeorm";
import Endpoint from "../services/Endpoint";
import Entity from "../services/Entity";
import Environmental from "../services/Environmental";
import Exception from "../services/Exception";
import Response from "../services/Response";
import IMSC from "../typings/IMSC";
import Basket from "./Basket";
import User from "./User";
import uuid from "uuid";

@TypeORM.Entity()
class Checkout extends Entity {
  
  @TypeORM.PrimaryGeneratedColumn("uuid")
  public readonly id: string;
  
  @TypeORM.Column({default: false})
  public price: number;
  
  @TypeORM.CreateDateColumn()
  public readonly time_created: Date;
  
  @TypeORM.UpdateDateColumn()
  public readonly time_updated: Date;
  
  /* Relations */
  
  @TypeORM.OneToOne(type => Basket)
  @TypeORM.JoinColumn({name: "basket"})
  public basket: Basket;
  
  @TypeORM.ManyToOne(type => User, user => user.checkouts, {cascade: true, eager: true, nullable: true})
  @TypeORM.JoinColumn({name: "user"})
  public user: User | null;
  
  public static async find(request: Endpoint.Request<Endpoint.FindQuery, Checkout.FindRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      const checkouts = await Environmental.db_manager.find(this, Object.assign({user: request.body.user}, Endpoint.parseFindQueryOptions(request.query)));
      new Response(Response.Code.OK, checkouts.map(v => v.toJSON())).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in find method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async create(request: Endpoint.Request<object, Checkout.CreateRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      const basket = await Environmental.db_manager.findOne(Basket, {where: {id: request.body.basket}});
      if (!basket) return new Response(Response.Code.NotFound, {basket: request.body.basket}).Complete(response);
      const user = await Environmental.db_manager.findOne(User, {where: {id: request.body.user}});
      if (!user) return new Response(Response.Code.NotFound, {user: request.body.user}).Complete(response);
      const checkout = new Checkout();
      
      checkout.basket = basket;
      checkout.user = user;
      checkout.price = basket.products.reduce((r, v) => r + v.quantity * v.product.price, 0);
      await Environmental.db_manager.save(checkout);
      
      basket.flag_completed = true;
      
      await Promise.all(basket.products.map(async v => {
        v.product.stock -= v.quantity;
        const message: IMSC.AMQPMessage<IMSC.AMQP.WebsocketMessage> = {id: uuid.v4(), target: "websocket", source: "checkout", method: "product_update", parameters: [v.product.id]};
        Environmental.mq_channel.sendToQueue("websocket", Buffer.from(JSON.stringify(message)))
        return await Environmental.db_manager.save(v.product);
      }));
      
      await Environmental.db_manager.save(basket);
      
      new Response(Response.Code.OK, checkout.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in find method on ${this.name} entity.`, e)).Complete(response);
    }
  }
}

namespace Checkout {
  
  export interface FindRequestBody {
    user: string
  }
  
  export interface CreateRequestBody {
    user: string
    basket: string
  }
  
}

export default Checkout;
