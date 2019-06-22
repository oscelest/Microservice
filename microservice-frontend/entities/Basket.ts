import {AppResponse} from "../pages/_app";
import SingletonEntity from "../services/SingletonEntity";
import User from "./User";

class Basket extends SingletonEntity<BasketContent> {
  
  constructor() {
    super();
    this.content.id = localStorage.basket;
  }
  
  public find() {
    return fetch(`${location.protocol}//api.${location.host}/basket/${this.content.id}`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(res => {
      if (res.status === 200) return res.json() as Promise<BasketGetByIdResponse>;
      if (res.status !== 404) {
        if (res.status !== 401 && res.status !== 403) return Promise.reject(res);
        localStorage.removeItem("basket");
      }
      return fetch(`${location.protocol}//api.${location.host}/basket`, {
        method:  "POST",
        headers: {
          "Authorization": localStorage.getItem("jwt") || "",
          "Content-Type":  "application/x-www-form-urlencoded",
        },
      })
      .then(res => res.status === 200 ? res.json() : Promise.reject(res));
    })
    .then(res => {
      console.log("RES", res);
      localStorage.basket = res.content.id;
      this.content.id = res.content.id;
      this.content.user = res.content.user || null;
      this.content.products = res.content.products || [];
      this.content.flag_abandoned = res.content.flag_abandoned;
      this.content.flag_completed = res.content.flag_completed;
      this.content.time_created = new Date(res.content.time_created);
      this.content.time_updated = new Date(res.content.time_updated);
    })
    .catch(err => {
      console.log("ERR", err);
    });
  }
  
}

interface BasketContent {
  id: string;
  user: User
  products: {[key: string]: any}
  flag_completed: boolean;
  flag_abandoned: boolean;
  time_created: Date;
  time_updated: Date;
}

interface BasketGetByIdResponse extends AppResponse {
  content: BasketContent
}

export default Basket;
