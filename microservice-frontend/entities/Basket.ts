import uuid from "uuid";
import Entity, {EntityObject, JSONResponse} from "../services/Entity";
import BasketProduct from "./BasketProduct";
import Product from "./Product";
import User from "./User";

class Basket extends Entity {
  
  public id: string;
  public user: User;
  public products: BasketProduct[];
  public flag_abandoned: boolean;
  public flag_completed: boolean;
  public time_created: Date;
  public time_updated: Date;
  
  public static Instance: Basket = new Basket({id: "", user: null as any, products: [], flag_abandoned: false, flag_completed: false, time_created: new Date(0), time_updated: new Date(0)});
  
  constructor(object: EntityObject<Basket>) {
    super();
    if (!Basket.Instance) Basket.Instance = this;
    Basket.Instance.id = this.id = object.id;
    Basket.Instance.user = this.user = object.user;
    Basket.Instance.products = this.products = (object.products || []).map(v => new BasketProduct(v));
    Basket.Instance.flag_abandoned = this.flag_abandoned = object.flag_abandoned;
    Basket.Instance.flag_completed = this.flag_completed = object.flag_completed;
    Basket.Instance.time_created = this.time_created = new Date(object.time_created || 0);
    Basket.Instance.time_updated = this.time_updated = new Date(object.time_updated || 0);
  }
  
  public static findBasketProduct(product_id: string) {
    return this.Instance.products.find(v => v.product.id === product_id);
  }
  
  public static clean() {
    for (const index in Basket.Instance.products) if (Basket.Instance.products[index].quantity < 1) delete Basket.Instance.products[index];
  }
  
  public static async findCurrent(): Promise<Basket | null> {
    return await fetch(`${location.protocol}//api.${location.host}/basket/${localStorage.basket || ""}`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(async res => await res.json() as JSONResponse<EntityObject<Basket>>)
    .then(async res => {
      if (res.code === 200) {
        localStorage.basket = res.content.id;
        return new this(res.content);
      }
      return null;
    });
  }
  
  public static async findLast(): Promise<Basket | null> {
    return await fetch(`${location.protocol}//api.${location.host}/basket/last`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(async res => await res.json() as JSONResponse<EntityObject<Basket>>)
    .then(async res => {
      if (res.code === 200) {
        localStorage.basket = res.content.id;
        return new this(res.content);
      }
      return null;
    });
  }
  
  public static async create(): Promise<Basket> {
    return await fetch(`${location.protocol}//api.${location.host}/basket`, {
      method:  "POST",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(async res => await res.json() as JSONResponse<EntityObject<Basket>>)
    .then(async res => {
      if (res.code === 200) {
        localStorage.basket = res.content.id;
        return new this(res.content);
      }
      throw res;
    });
  }
  
  public static async update(): Promise<Basket> {
    try {
      console.log(Basket.Instance);
      if (!Basket.Instance.id) await Basket.create();
      await fetch(`${location.protocol}//api.${location.host}/basket/${Basket.Instance.id}`, {
        method:  "PUT",
        headers: {
          "Authorization": localStorage.getItem("jwt") || "",
          "Content-Type":  "application/x-www-form-urlencoded",
        },
        body:    `${User.Instance.id ? `user=${User.Instance.id}&` : ''}flag_completed=${Basket.Instance.flag_completed}&flag_abandoned=${Basket.Instance.flag_abandoned}`,
      });
      await Promise.all(Basket.Instance.products.map(async v => {
        return console.log(v);
      }))
      
      // await Basket.Instance.products.forEach(async v => {
      //   console.log("what?")
      //   try {
      //     console.log("fetching something glorious", v);
      //     await fetch(`${location.protocol}//api.${location.host}/basket/${Basket.Instance.id}/product`, {
      //       method:  "POST",
      //       headers: {
      //         "Authorization": localStorage.getItem("jwt") || "",
      //         "Content-Type":  "application/x-www-form-urlencoded",
      //       },
      //       body:    `quantity=${v.quantity}&product=${v.product.id}`,
      //     });
      //   }
      //   catch (e) {
      //     console.log("ERROR INNER", e)
      //   }
      // });
    }
    catch (e) {
      console.log("ERROR OUTER", e)
    }
    return Basket.Instance;
  }
  
  
  public static async setProduct(product: Product, quantity: number): Promise<Basket> {
    const basket_product = Basket.findBasketProduct(product.id) || new BasketProduct({id: uuid.v4(), quantity: quantity, product: product, time_created: new Date(), time_updated: new Date()});
    basket_product ? (basket_product.quantity = quantity) : Basket.Instance.products.push(basket_product);
    return await Basket.update();
  }
  
  
}

export interface BasketContent {
  id: string;
  user: User
  products: BasketProductContent[]
  flag_completed: boolean;
  flag_abandoned: boolean;
  time_created: Date;
  time_updated: Date;
}

export interface BasketProductContent {
  id: string
  quantity: number
  time_created: Date
  time_updated: Date
  product: Product
}

export default Basket;
