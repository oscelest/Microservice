import bodyParser from "body-parser";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import _ from "lodash";
import methodOverride from "method-override";
import User from "../entities/User";
import Entity from "./Entity";
import Environmental from "./Environmental";
import Exception from "./Exception";
import Response from "./Response";

class Endpoint<Q extends object, B extends object, P extends object> {
  
  public path: string;
  public method: Endpoint.Method;
  public callback: Endpoint.RouteMiddleware<Q, B, P>;
  
  public static static_directory: string;
  
  public static readonly server: http.Server;
  public static readonly port: number = +(process.env.PORT || 3000);
  public static readonly flag_published: boolean = false;
  private static readonly application: express.Application = express();
  private static readonly endpoints: { [K in Endpoint.Method]?: {[key: string]: Endpoint<object, object, object>} } = {};
  private static readonly url_parameters: {[key: string]: Endpoint.URLParameter} = {};
  
  constructor(path: string, method: Endpoint.Method, callback: Endpoint.RouteMiddleware<Q, B, P>) {
    this.path = "/" + path.replace(/\/{2,}|^\/+|\/+$/g, "");
    this.method = method;
    this.callback = callback;
    _.set(Endpoint.endpoints, [this.method, this.path], this);
  }
  
  public static setURLParameter(identifier: string, priority: number, callback: Endpoint.ParameterMiddleware<object, object, object>): typeof Endpoint {
    identifier = identifier.replace(/[^a-z]/gi, "");
    if (this.url_parameters[identifier]) {
      this.url_parameters[identifier].priority = priority;
      this.url_parameters[identifier].callback = callback;
      return this;
    }
    this.url_parameters[identifier] = new Endpoint.URLParameter(identifier, priority, callback);
    return this;
  }
  
  public static publish() {
    if (this.flag_published) throw new Exception();
    this.application.use(bodyParser.json());
    this.application.use(bodyParser.urlencoded({extended: false}));
    this.application.use(methodOverride("X-HTTP-Method-Override"));
    this.application.use(async (request: express.Request, response: express.Response, next: express.NextFunction) => {
      if ((request.headers.host || request.hostname || _.first(request.headers.origin)).match(new RegExp(`(?<=(?:^|https?:\/\/)(?:(?:[a-z]+)\\.)*)${process.env.HOST}(?=\/|$)`))) {
        response.header("Access-Control-Allow-Origin", request.headers.host || request.hostname || _.first(request.headers.origin));
        response.header("Access-Control-Allow-Origin", "http://" + process.env.HOST);
      }
      response.header("Allow", "PUT, GET, POST, DELETE, OPTIONS, JSONP");
      response.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS, JSONP");
      response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      response.header("Access-Control-Allow-Credentials", "true");
      response.header("X-Frame-Options", "DENY");
      response.locals.time = new Date();
      response.locals.params = {};
      
      if (request.get("Authorization")) {
        try {
          const decoded = jwt.verify(request.get("Authorization") || "", process.env.SECRET_JWT || "") as User.JWT;
          response.locals.user = await Environmental.db_manager.findOne(User, {where: {id: decoded.id}}) || null;
          return next();
        }
        catch (err) {
          return next();
        }
      }
      next();
    });
    if (this.static_directory) this.application.use(express.static(this.static_directory));
    _.each(this.url_parameters, parameter => this.application.param(parameter.identifier, parameter.callback));
    _.each(this.endpoints, (paths, method) => {
      const stats: {[key: string]: number} = {max: 0, index: 0};
      const priorities: {[key: string]: number[]} = {};
      _.each(paths, (endpoint, path) => {
        priorities[path] = path.replace(/^\/|\/$/g, "").split(/^\/|\//g).map((part, index) => {
          if (stats["index"] < index) stats["index"] = index;
          if (part[0] === "*") return 0;
          if (part[0] !== ":") return null;
          const parameter = part.substring(1);
          if (!this.url_parameters[parameter]) {
            console.warn(`'${parameter}' URL parameter is missing a definition in path '${path}'.`);
            return 0;
          }
          const priority = this.url_parameters[parameter].priority;
          stats[index] = Math.max(stats[index], `${priority}`.length);
          stats.max = Math.max(stats.max, priority);
          return priority;
        });
      });
      const endpoints: {[key: string]: Endpoint<object, object, object>[]} = _.reduce(priorities, (result, parts, path) => {
        let key: string;
        const array = Array(stats.index + 1);
        if (_.every(parts, v => v === null)) {
          key = array.fill(stats.max + 1).join(".");
        }
        else {
          const diff = array.length - parts.length;
          key = _.reduce(array, (result, value, index) => {
            const di = index - diff;
            if (di < 0) return _.set(result, index, 0);
            const pdi = parts[di];
            if (!pdi && pdi !== 0) return _.set(result, index, stats.max + 1);
            return _.set(array, index, _.padStart(`${parts[di]}`, stats[index], "0"));
          }, array).join(".");
        }
        !result[key] ? result[key] = [paths[path]] : result[key].push(paths[path]);
        return result;
      }, {});
      Object.keys(endpoints).sort().reverse().map(v => endpoints[v]).forEach(endpoints =>
        endpoints.forEach(endpoint => {
          this.application[method.toLowerCase()](endpoint.path, endpoint.callback);
        }),
      );
    });
    Object.assign(this, {
      server:         http.createServer(this.application).listen(process.env.PORT),
      flag_published: true,
    });
  }
  
  public static parseFindQueryOptions(query: Endpoint.FindQuery) {
    const options: import("typeorm").FindManyOptions = {};
    if (query.start) options.skip = query.start;
    if (query.limit) options.take = query.limit;
    if (query.sort) query.sort.split(/,/g).map(v => v.split(/[:=]/g)).reduce((r, v) => Object.assign(r, {[v[0]]: v[1] === "desc" ? "desc" : "asc"}), options);
    return options;
  }
  
  public static setPermissionLevel(level: number) {
    return async (request: Endpoint.Request<{[key: string]: any}, object>, response: Endpoint.Response<object>, next: express.NextFunction) => {
      if (!response.locals.user) return new Response(Response.Code.Unauthorized, {Authorization: request.get("Authorization")}, response.locals.time).Complete(response);
      if (response.locals.user.level < level) return new Response(Response.Code.Forbidden, {Authorization: request.get("Authorization")}, response.locals.time).Complete(response);
      next();
    };
  }
  
  public static queryFields(fields: string[] | {[key: string]: Endpoint.Parameter<Endpoint.ParameterType>}) {
    return (request: Endpoint.Request<{[key: string]: any}, object>, response: Endpoint.Response<object>, next: express.NextFunction) => {
      if (_.some(Endpoint.requestFieldsParse(request.query, fields), v => v === null)) {
        return new Response(Response.Code.BadRequest, {query: request.query}, response.locals.time).Complete(response);
      }
      next();
    };
  }
  
  public static bodyFields(fields: string[] | {[key: string]: Endpoint.Parameter<Endpoint.ParameterType>}) {
    return (request: Endpoint.Request<object, {[key: string]: any}>, response: Endpoint.Response<object>, next: express.NextFunction) => {
      if (_.some(Endpoint.requestFieldsParse(request.body, fields), v => v === null)) {
        return new Response(Response.Code.BadRequest, {body: request.body}, response.locals.time).Complete(response);
      }
      next();
    };
  }
  
  private static requestFieldsParse(object: {[key: string]: string}, fields: string[] | {[key: string]: Endpoint.Parameter<Endpoint.ParameterType>}): {[key: string]: any} {
    const parameters: {[key: string]: Endpoint.Parameter<Endpoint.ParameterType>} = Array.isArray(fields) ? _.zipObject(fields, Array(fields.length).fill({type: "string"})) : fields;
    return _.reduce(object, (result, value, key) => {
      if (!parameters[key]) delete result[key];
      else if (value === null) return result;
      else {
        if (parameters[key].type === "string") {
          const parameter = (parameters[key] || {}) as Endpoint.Parameter<"string">;
          if (value.length < (parameter.min_length || Number.MIN_SAFE_INTEGER) || value.length > (parameter.max_length || Number.MAX_SAFE_INTEGER)) return _.set(result, key, null);
          return result;
        }
        if (parameters[key].type === "number") {
          const parameter = (parameters[key] || {}) as Endpoint.Parameter<"number">;
          if (isNaN(+value) || +value < (parameter.min_value || Number.MIN_SAFE_INTEGER) || +value > (parameter.max_value || Number.MAX_SAFE_INTEGER)) return _.set(result, key, null);
          return _.set(result, key, +value);
        }
        if (parameters[key].type === "boolean") {
          return _.set(result, key, ["1", "true"].includes(value) ? true : ["0", "false"].includes(value) ? false : null);
        }
        if (parameters[key].type === "email") {
          return value.match(/[^@]+@[^@]+\.[^@]+/) ? result : _.set(result, key, null);
        }
        if (parameters[key].type === "password") {
          return value.match(/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9@%+\\\/'!#$^?:.(){}[\]~\-_,]{8,}$/) ? result : _.set(result, key, null);
        }
        if (parameters[key].type === "uuid") {
          return _.set(result, key, Entity.isUUID(value) ? value  : null);
        }
        if (parameters[key].type === "timestamp") {
          const parameter = (parameters[key] || {}) as Endpoint.Parameter<"timestamp">;
          const date = new Date(value);
          return _.set(result, key, !isNaN(date.getTime()) ? (parameter.convert === false ? value : date) : null);
        }
      }
      return result;
    }, _.reduce(parameters, (result, value, key) => result[key] !== undefined || value.optional ? result : _.set(result, key, null), object));
  }
  
}

namespace Endpoint {
  
  export class URLParameter {
    public identifier: string;
    public priority: number;
    public callback: ParameterMiddleware<object, object, object>;
    
    constructor(identifier: string, priority: number, callback: ParameterMiddleware<object, object, object>) {
      this.identifier = identifier;
      this.priority = priority;
      this.callback = callback;
    }
  }
  
  export type Request<Query extends {}, Body extends {}> = Pick<express.Request, Exclude<keyof express.Request, "body" | "query">> & {query: QueryParameters<Query>, body: BodyParameters<Body>}
  export type Response<Parameters extends {}> = Pick<express.Response, Exclude<keyof express.Response, "locals">> & {locals: Locals<Parameters>}
  
  export type QueryParameters<Query extends {[key: string]: string}> = Query
  export type BodyParameters<Body extends {[key: string]: string}> = Body
  
  export type ParameterType = "string" | "boolean" | "number" | "email" | "password" | "uuid" | "timestamp";
  export type Parameter<T extends ParameterType> =
    T extends "string" ? ParameterObject<"string"> & {min_length?: number, max_length?: number} :
    T extends "number" ? ParameterObject<"number"> & {min_value?: number, max_value?: number} :
    T extends "timestamp" ? ParameterObject<"timestamp"> & {convert?: boolean} :
    ParameterObject<T>;
  
  export interface ParameterObject<T extends ParameterType> {
    type: T,
    optional?: boolean
  }
  
  export type Locals<Params extends {}> = {
    user: User
    params: Params
    time: Date;
  }
  
  export type FindQuery = {
    start: number
    limit: number
    sort: string
    order: string
  }
  
  export type UUIDLocals = {
    id: string
  }
  
  export enum Method {
    GET = "get",
    POST = "post",
    PUT = "put",
    PATCH = "patch",
    DELETE = "delete"
  }
  
  export type Middleware<Q extends object, B extends object, P extends object> = (request: Request<Q, B>, response: Response<P>, next: express.NextFunction) => void;
  export type RouteMiddleware<Q extends object, B extends object, P extends object> = Middleware<Q, B, P> | Middleware<Q, B, P>[]
  export type ParameterMiddleware<Q extends object, B extends object, P extends object> = (request: Request<Q, B>, response: Response<P>, next: express.NextFunction, id?: string, param?: string) => void;
  
}

export default Endpoint;
