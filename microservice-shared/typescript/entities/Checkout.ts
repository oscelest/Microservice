import * as TypeORM from "typeorm";
import Endpoint from "../services/Endpoint";
import Entity from "../services/Entity";
import Environmental from "../services/Environmental";
import Exception from "../services/Exception";
import Response from "../services/Response";
import Basket from "./Basket";
import User from "./User";

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
  public basket: Basket;
  
  @TypeORM.ManyToOne(type => User, user => user.checkouts, {cascade: true, eager: true, nullable: true})
  @TypeORM.JoinColumn({name: "user"})
  public user: User | null;
  
  public static async find(request: Endpoint.Request<Endpoint.FindQuery, object>, response: Endpoint.Response<object>): Promise<void> {
    try {
      new Response(Response.Code.OK, (await Environmental.db_manager.find(this, Endpoint.parseFindQueryOptions(request.query))).map(v => v.toJSON())).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in find method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async create(request: Endpoint.Request<object, Checkout.CreateRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      const basket = await Environmental.db_manager.findOneOrFail(Basket, {where: {id: request.body.basket}});
      const user = await Environmental.db_manager.findOneOrFail(User, {where: {id: request.body.user}});
      const checkout = new Checkout();
      checkout.basket = basket;
      checkout.user = user;
      checkout.price = basket.products.reduce((r, v) => r = r + v.quantity * v.product.price, 0);
      basket.flag_completed = true;
      await Environmental.db_manager.save(checkout);
      new Response(Response.Code.OK, checkout.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in find method on ${this.name} entity.`, e)).Complete(response);
    }
  }
}

namespace Checkout {
  
  export interface CreateRequestBody {
    user: string
    basket: string
  }
  
}

export default Checkout;
