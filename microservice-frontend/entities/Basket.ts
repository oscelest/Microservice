import {Response} from "../pages/_app";
import SingletonEntity from "../services/SingletonEntity";
import Product from "./Product";
import User from "./User";

class Basket extends SingletonEntity<BasketContent> {
  
  constructor() {
    super();
  }
  
  public find(): Promise<BasketContent> {
    return Basket.findById(this);
  }
  
  public static findById(): Promise<BasketContent>
  public static findById(id: string): Promise<BasketContent>
  public static findById(basket: Basket): Promise<BasketContent>
  public static findById(basket_or_id?: Basket | string): Promise<BasketContent> {
    const id = basket_or_id && basket_or_id instanceof Basket ? basket_or_id.content.id : basket_or_id;
    return fetch(`${location.protocol}//api.${location.host}/basket/${id || localStorage.basket}`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(res => res.json() as Promise<BasketFindByIdResponse>)
    .then(res => {
      if (res.code === 200) {
        localStorage.basket = res.content.id;
        return Promise.resolve(res.content)
      }
      return Promise.reject(res)
    });
  }
  
  public findLast() {
    return Basket.findLast();
  }
  
  public static findLast() {
    return fetch(`${location.protocol}//api.${location.host}/basket/last`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(res => res.json() as Promise<BasketFindLastResponse>)
    .then(res => {
      if (res.code === 200) {
        localStorage.basket = res.content.id;
        return Promise.resolve(res.content)
      }
      return Promise.reject(res)
    });
  }
  
  public create(): Promise<BasketContent> {
    return Basket.create();
  }
  
  public static create(): Promise<BasketContent> {
    return fetch(`${location.protocol}//api.${location.host}/basket`, {
      method:  "POST",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(res => res.json() as Promise<BasketCreateResponse>)
    .then(res => {
      if (res.code === 200) {
        localStorage.basket = res.content.id;
        return Promise.resolve(res.content)
      }
      return Promise.reject(res)
    });
  }
  
}

export interface BasketContent {
  id: string;
  user: User
  products: Product[]
  flag_completed: boolean;
  flag_abandoned: boolean;
  time_created: Date;
  time_updated: Date;
}

interface BasketFindLastResponse extends Response {
  content: BasketContent
}

interface BasketFindByIdResponse extends Response {
  content: BasketContent
}

interface BasketCreateResponse extends Response {
  content: BasketContent
}

export default Basket;
