import Entity, {EntityObject, JSONResponse} from "../services/Entity";
import Basket from "./Basket";
import User from "./User";

class Checkout extends Entity {
  
  public id: string;
  public price: number;
  public user: EntityObject<User>;
  public basket: EntityObject<Basket>;
  public time_created: Date;
  public time_updated: Date;
  
  public static checkouts: {[key: string]: Checkout} = {};
  
  constructor(object: EntityObject<Checkout>) {
    super();
    this.id = object.id;
    this.price = object.price;
    this.user = object.user;
    this.basket = object.basket;
    this.time_created = new Date(object.time_created);
    this.time_updated = new Date(object.time_updated);
    return this;
  }
  
  public static async find(start = 0, limit = 1000): Promise<Checkout[] | JSONResponse<any>> {
    try {
      const response = await fetch(`${location.protocol}//api.${location.host}/checkout?start=${start}&limit=${limit}`, {
        method:  "GET",
        headers: {
          "Authorization": localStorage.getItem("jwt") || "",
          "Content-Type":  "application/x-www-form-urlencoded",
        },
      });
      const object: JSONResponse<EntityObject<Checkout>[]> = await response.json();
      if (object.code === 200) return object.content.map(object => Checkout.checkouts[object.id] = new Checkout(object));
      return object;
    }
    catch (exception) {
      return {code: 500, content: {}, time_started: new Date().toISOString(), time_complete: new Date().toISOString(), time_elapsed: "0ms"} as JSONResponse<any>;
    }
  }
  
  public static async create(): Promise<Checkout | JSONResponse<any>> {
    try {
      const response = await fetch(`${location.protocol}//api.${location.host}/checkout`, {
        method:  "POST",
        headers: {
          "Authorization": localStorage.getItem("jwt") || "",
          "Content-Type":  "application/x-www-form-urlencoded",
        },
        body:    `basket=${Basket.Instance.id}`,
      });
      const object: JSONResponse<EntityObject<Checkout>> = await response.json();
      if (object.code === 200) return new Checkout(object.content);
      return object;
    }
    catch(e) {
      throw e;
    }
  }
  
}

export default Checkout;
