import Entity, {EntityObject, JSONResponse} from "../services/Entity";
import Basket from "./Basket";
import User from "./User";

class Checkout extends Entity {
  
  public id: string;
  public price: number;
  public user: User;
  public basket: Basket;
  public time_created: Date;
  public time_updated: Date;
  
  constructor(object: EntityObject<Checkout>) {
    super();
    this.id = object.id;
    this.price = object.price;
    this.user = new User(object.user);
    this.basket = new Basket(object.basket);
    this.time_created = new Date(object.time_created);
    this.time_updated = new Date(object.time_updated);
    return this;
  }
  
  public static async find(start = 0, limit = 10): Promise<Checkout[]> {
    return await fetch(`${location.protocol}//api.${location.host}/checkout?start=${start}&limit=${limit}`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(async res => await res.json() as JSONResponse<EntityObject<Checkout>[]>)
    .then(async res => {
      if (res.code === 200) return res.content.map(object => new Checkout(object));
      throw res;
    });
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
