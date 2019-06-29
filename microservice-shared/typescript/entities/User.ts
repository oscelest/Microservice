import crypto from "crypto";
import jwt from "jsonwebtoken";
import _ from "lodash";
import * as TypeORM from "typeorm";
import Endpoint from "../services/Endpoint";
import Entity from "../services/Entity";
import Environmental from "../services/Environmental";
import Exception from "../services/Exception";
import Response from "../services/Response";
import Basket from "./Basket";
import Checkout from "./Checkout";

@TypeORM.Entity()
@TypeORM.Unique("email", ["email"])
class User extends Entity {
  
  @TypeORM.PrimaryGeneratedColumn("uuid")
  public readonly id: string;
  
  @TypeORM.Column({length: 64})
  public username: string;
  
  @TypeORM.Column({length: 255})
  public email: string;
  
  @TypeORM.Column({type: "tinyint", default: 0})
  public level: number;
  
  @TypeORM.Column({type: "binary", length: 128})
  public readonly hash: Buffer;
  
  @TypeORM.Column({type: "binary", length: 128})
  public readonly salt: Buffer;
  
  @TypeORM.Column({type: "binary", length: 16})
  public secret: Buffer  = crypto.randomBytes(16);
  
  @TypeORM.Column({nullable: true})
  public readonly time_login: Date;
  
  @TypeORM.CreateDateColumn()
  public readonly time_created: Date;
  
  @TypeORM.UpdateDateColumn()
  public readonly time_updated: Date;
  
  /* Relations - Outgoing */
  
  @TypeORM.OneToMany(type => Basket, basket => basket.user)
  public baskets: Basket[];
  
  @TypeORM.OneToMany(type => Checkout, checkout => checkout.user)
  public checkouts: Checkout[];
  
  /* Relations - Incoming */
  
  public set password(password: string) {
    _.set(this, "salt", crypto.randomBytes(128));
    _.set(this, "hash", crypto.pbkdf2Sync(password, this.salt, 100000, 128, "sha512"));
  }
  
  public toJSON(): Partial<{ [K in keyof this]: this[K] }> {
    return _.pick(super.toJSON(), ["id", "username", "level", "email", "time_created", "time_login"]) as Partial<{ [K in keyof this]: this[K] }>;
  }
  
  public validatePassword(password: string): boolean {
    return crypto.pbkdf2Sync(password, this.salt, 100000, 128, "sha512").equals(this.hash);
  }
  
  public static async create(request: Endpoint.Request<object, User.CreateRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      if (await Environmental.db_manager.findOne(User, {where: {email: request.body.email}})) return new Response(Response.Code.Conflict, request.body).Complete(response);
      const user = new User();
      user.email = request.body.email;
      user.username = request.body.username;
      user.password = request.body.password;
      await Environmental.db_manager.save(user);
      setTimeout(() => new Response(Response.Code.OK, user.toJSON()).Complete(response), 3000);
    }
    catch (e) {
      new Response(Response.Code.InternalServerError, new Exception("Unhandled exception on POST:/user", e)).Complete(response);
    }
  }
  
  public static async login(request: Endpoint.Request<object, User.LoginRequestBody>, response: Endpoint.Response<object>): Promise<void> {
    try {
      const user = await this.loginUser(request);
      _.set(user, "time_login", new Date());
      await Environmental.db_manager.save(user);
      new Response(Response.Code.OK, {object: user.toJSON(), jwt: jwt.sign({id: user.id, type: "normal"}, Environmental.tokens.jwt, {expiresIn: "1w"})}).Complete(response);
      
    }
    catch (e) {
      if (e instanceof Exception.MalformedRequestException) return new Response(Response.Code.BadRequest, e.content).Complete(response);
      if (e instanceof Exception.UnauthorizedRequestException) return new Response(Response.Code.Unauthorized, e.content).Complete(response);
      return new Response(Response.Code.InternalServerError, new Exception("Unhandled exception on POST:/user/login", e)).Complete(response);
    }
  }
  
  private static async loginUser(request: Endpoint.Request<object, User.LoginRequestBody>): Promise<User> {
    if (request.body.email && request.body.password) return this.loginPassword(request);
    return this.loginJWT(request.get("Authorization") || "");
  }
  
  private static async loginPassword(request: Endpoint.Request<object, User.LoginRequestBody>) {
    const user = await Environmental.db_manager.findOne(User, {where: {email: request.body.email}});
    if (!user || !user.validatePassword(request.body.password)) throw new Exception.MalformedRequestException("Could not validate user information.", request.body);
    return user;
  }
  
  private static async loginJWT(auth: string): Promise<User> {
    if (!auth) throw new Exception.UnauthorizedRequestException("Could not authorize JWT.", {jwt: auth});
    const decoded = <User.JWT>jwt.decode(auth);
    if (!decoded) throw new Exception.MalformedRequestException("No user given by JWT.", {jwt: auth});
    const user = await Environmental.db_manager.findOne(User, {where: {id: decoded.id}});
    if (!user) throw new Exception.MalformedRequestException("User given by JWT doesn't exist.", {jwt: auth});
    switch (decoded.type) {
      case "activation":
        return jwt.verify(auth, Environmental.tokens.jwt + user.time_created.getTime()) ? user : Promise.reject(new Exception.MalformedRequestException("No user given by JWT.", {jwt: auth}));
      case "reset":
        return jwt.verify(auth, Environmental.tokens.jwt + user.time_updated.getTime()) ? user : Promise.reject(new Exception.MalformedRequestException("No user given by JWT.", {jwt: auth}));
      default:
        return jwt.verify(auth, Environmental.tokens.jwt) ? user : Promise.reject(new Exception.MalformedRequestException("No user given by JWT.", {jwt: auth}));
    }
  }
}

namespace User {
  export type JWT = {
    id: string
    type: "normal" | "reset" | "activation"
  }
  
  export type CreateRequestBody = {
    username: string
    email: string
    password: string
  }
  
  export type LoginRequestBody = {
    email: string
    password: string
  }
}

export default User;
