import _ from "lodash";
import * as TypeORM from "typeorm";
import uuid from "uuid";
import Endpoint from "../services/Endpoint";
import Entity from "../services/Entity";
import Environmental from "../services/Environmental";
import Exception from "../services/Exception";
import Response from "../services/Response";
import BasketProduct from "./BasketProduct";
import Product from "./Product";
import User from "./User";

@TypeORM.Entity()
class Basket extends Entity {
  
  @TypeORM.PrimaryColumn({type: "binary", length: 16, readonly: true, nullable: false})
  public readonly id: Buffer;
  
  @TypeORM.Column({default: false})
  public flag_abandoned: boolean;
  
  @TypeORM.Column({default: false})
  public flag_completed: boolean;
  
  @TypeORM.CreateDateColumn()
  public readonly time_created: Date;
  
  @TypeORM.UpdateDateColumn()
  public readonly time_updated: Date;
  
  /* Relations */
  
  @TypeORM.OneToMany(type => BasketProduct, product => product.basket, {eager: true})
  public products: BasketProduct[];
  
  @TypeORM.ManyToOne(type => User, user => user.baskets, {cascade: true, eager: true})
  public user: User;
  
  /* Column Initialization */
  
  @TypeORM.BeforeInsert()
  private beforeInsert() {
    if (!this.id) _.set(this, "id", Buffer.from(uuid.v4().replace(/-/g, ""), "hex"));
  }
  
  public static async find(request: Endpoint.Request<Endpoint.FindQuery, object>, response: Endpoint.Response<object>): Promise<void> {
    try {
      const entities = await Environmental.db_manager.find(this, Endpoint.parseFindQueryOptions(request.query));
      new Response(Response.Code.OK, entities.map(v => v.toJSON())).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in find method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async findById(request: Endpoint.Request<object, object>, response: Endpoint.Response<Endpoint.UUIDLocals>): Promise<void> {
    try {
      const entity = await Environmental.db_manager.findOne(this, {where: {id: response.locals.params.id}, relations: ["user", "products"]});
      if (!entity) return new Response(Response.Code.NotFound, {id: response.locals.params.uuid}).Complete(response);
      new Response(Response.Code.OK, entity.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in findById method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async findLast(request: Endpoint.Request<object, Basket.FindLastRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      const entity = await Environmental.db_manager.findOne(this, {
        where:     {
          user:           {id: Entity.bufferFromUUID(request.body.user)},
          flag_abandoned: false,
          flag_completed: false,
        },
        relations: ["user", "products"],
      });
      if (!entity) return new Response(Response.Code.NotFound, {}).Complete(response);
      new Response(Response.Code.OK, entity.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in findById method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async create(request: Endpoint.Request<object, Basket.CreateRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      const basket = new this();
      if (basket.id) return new Response(Response.Code.Conflict, request.body).Complete(response);
      basket.user = (await Environmental.db_manager.findOne(User, {where: {id: Entity.bufferFromUUID(request.body.user)}}) || null) as User;
      await Environmental.db_manager.save(basket);
      new Response(Response.Code.OK, basket.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in create method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async update(request: Endpoint.Request<object, Basket.UpdateRequestBody>, response: Endpoint.Response<Endpoint.UUIDLocals>): Promise<void> {
    try {
      const basket = await Environmental.db_manager.findOne(this, {where: {id: response.locals.params.id}});
      if (!basket) return new Response(Response.Code.NotFound, request.body).Complete(response);
      if (request.body.user) {
        const user = await Environmental.db_manager.findOne(User, {where: {id: Entity.bufferFromUUID(request.body.user)}, relations: ["baskets"]}) || null;
        console.log(user);
        user.baskets.push(basket);
        console.log(user);
        const t = await Environmental.db_manager.save(User, user);
        console.log(t);
        basket.user = t;
        
        // basket.user = await Environmental.db_manager.findOne(User, {where: {id: Entity.bufferFromUUID(request.body.user)}}) || null;
        // console.log()
      }
      if (request.body.flag_abandoned) basket.flag_abandoned = request.body.flag_abandoned;
      if (request.body.flag_completed) basket.flag_completed = request.body.flag_completed;
      // console.log(basket);
      
      new Response(Response.Code.OK, (await Environmental.db_manager.save(basket)).toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in update method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async setProduct(request: Endpoint.Request<object, Basket.SetProductRequestBody>, response: Endpoint.Response<Endpoint.UUIDLocals>): Promise<void> {
    try {
      const basket = await Environmental.db_manager.findOne(this, {where: {id: response.locals.params.id}});
      if (!basket) return new Response(Response.Code.NotFound, {id: response.locals.params.uuid}).Complete(response);
      const product = await Environmental.db_manager.findOne(Product, {where: {id: Entity.bufferFromUUID(request.body.product)}});
      if (!product) return new Response(Response.Code.NotFound, {product: request.body.product}).Complete(response);
      if (product.stock < request.body.quantity) return new Response(Response.Code.BadRequest, {stock: product.stock, quantity: request.body.quantity}).Complete(response);
      const basket_product = await Environmental.db_manager.findOne(BasketProduct, {where: {product: {id: product.id}, basket: {id: basket.id}}, relations: ["product"]}) || new BasketProduct();
      if (!basket_product.id) {
        basket_product.basket = basket;
        basket_product.product = product;
      }
      basket_product.quantity = request.body.quantity;
      await Environmental.db_manager.save(basket_product);
      new Response(Response.Code.OK, basket_product.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in update method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
}

namespace Basket {
  
  export interface FindLastRequestBody {
    user: string
  }
  
  export interface CreateRequestBody {
    user: string
    flag_abandoned: boolean
    flag_completed: boolean
  }
  
  export interface UpdateRequestBody {
    user: string
    flag_abandoned: boolean
    flag_completed: boolean
  }
  
  export interface SetProductRequestBody {
    product: string
    quantity: number
  }
  
}

export default Basket;
