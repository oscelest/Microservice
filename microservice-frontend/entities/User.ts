import Entity, {EntityObject, JSONResponse} from "../services/Entity";
import Basket from "./Basket";

class User extends Entity {
  
  public id: string;
  public email: string;
  public username: string;
  public level: number;
  public time_login: Date;
  public time_created: Date;
  
  public static Instance: User = new User({id: "", email: "", username: "", level: 0, time_created: new Date(0), time_login: new Date(0)});
  public static Loading: {login: Promise<EntityObject<User>> | null, signup: Promise<EntityObject<User>> | null} = {login: null, signup: null};
  
  constructor(object: EntityObject<User>) {
    super();
    if (!User.Instance) User.Instance = this;
    User.Instance.id = this.id = object.id;
    User.Instance.email = this.email = object.email;
    User.Instance.username = this.username = object.username;
    User.Instance.level = this.level = object.level;
    User.Instance.time_created = this.time_created = new Date(object.time_created || 0);
    User.Instance.time_login = this.time_login = new Date(object.time_login || 0);
  }
  
  public static async create(email: string, username: string, password: string): Promise<EntityObject<User>> {
    return await (User.Loading.signup = fetch(`${location.protocol}//api.${location.host}/user`, {
      method:  "POST",
      cache:   "no-cache",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body:    `email=${encodeURIComponent(email || "")}&username=${encodeURIComponent(username || "")}&password=${encodeURIComponent(password || "")}`,
    })
    .then(async res => await res.json() as JSONResponse<EntityObject<User>>)
    .then(async res => {
      if (res.code === 200) return res.content;
      throw res;
    })
    .finally(() => User.Loading.signup = null));
  }
  
  public static async login(): Promise<EntityObject<User>>
  public static async login(email: string, password: string): Promise<EntityObject<User>>
  public static async login(email?: string, password?: string): Promise<EntityObject<User>> {
    return await (User.Loading.login = fetch(`${location.protocol}//api.${location.host}/user/login`, {
      method:  "POST",
      cache:   "no-cache",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body:    email && password && `email=${encodeURIComponent(email || "")}&password=${encodeURIComponent(password || "")}`,
    })
    .then(async res => await res.json() as JSONResponse<{jwt: string, object: EntityObject<User>}>)
    .catch(() => ({code: 500, content: {}, time_complete: new Date().toISOString(), time_started: new Date().toISOString(), time_elapsed: "0ms"} as JSONResponse<any>))
    .then(async res => {
      if (res.code === 200) {
        localStorage.jwt = res.content.jwt;
        return res.content.object;
      }
      throw res;
    })
    .finally(() => User.Loading.login = null));
  }
  
  public static logout(): void {
    User.Instance.id = "";
    User.Instance.email = "";
    User.Instance.username = "";
    User.Instance.level = 0;
    User.Instance.time_created = new Date(0);
    User.Instance.time_login = new Date(0);
    Basket.Instance.id = "";
    Basket.Instance.products = [];
    Basket.Instance.user = null as any;
    Basket.Instance.flag_abandoned = false;
    Basket.Instance.flag_completed = false;
    Basket.Instance.time_created = new Date(0);
    Basket.Instance.time_updated = new Date(0);
    localStorage.removeItem("jwt");
    localStorage.removeItem("basket");
  }
  
}

export default User;
