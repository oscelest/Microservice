import _ from "lodash";
import * as TypeORM from "typeorm";
import uuid from "uuid";
import Endpoint from "../services/Endpoint";
import Entity from "../services/Entity";
import Environmental from "../services/Environmental";
import Exception from "../services/Exception";
import Response from "../services/Response";
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
  
  /* Relations - Outgoing */
  
  @TypeORM.ManyToMany(type => Product)
  @TypeORM.JoinTable()
  public products: Product[];
  
  /* Relations - Incoming */
  
  @TypeORM.ManyToOne(type => User, user => user.baskets)
  @TypeORM.JoinColumn({name: 'user'})
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
  
  public static async create(request: Endpoint.Request<object, Basket.CreateRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      console.log(request.body);
      console.log(request.query);
      const user = await Environmental.db_manager.findOne(User, {where: {id: Entity.bufferFromUUID(request.body.user || "")}}) || null;
      const basket = new this();
      
      if (basket.id) return new Response(Response.Code.Conflict, request.body).Complete(response);
      
      basket.user = user;
      
      await Environmental.db_manager.save(basket);
      new Response(Response.Code.OK, basket.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in create method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
  public static async update(request: Endpoint.Request<object, Basket.UpdateRequestBody>, response: Endpoint.Response<Endpoint.UUIDLocals>): Promise<void> {
    try {
      const user = await Environmental.db_manager.findOne(this, response.locals.params);
      if (!user) return new Response(Response.Code.NotFound, request.body).Complete(response);
      await Environmental.db_manager.save(Object.assign(user, request.body));
      new Response(Response.Code.OK, user.toJSON()).Complete(response);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception(`Unhandled exception in update method on ${this.name} entity.`, e)).Complete(response);
    }
  }
  
}

namespace Basket {
  
  export type CreateRequestBody = {
    user: Buffer
    flag_abandoned: boolean
    flag_completed: boolean
  }
  
  export type UpdateRequestBody = {
    id: Buffer
    user: Buffer
    flag_abandoned: boolean
    flag_completed: boolean
  }
  
}

export default Basket;
