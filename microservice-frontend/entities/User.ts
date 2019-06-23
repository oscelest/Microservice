import {Response} from "../pages/_app";
import SingletonEntity from "../services/SingletonEntity";

class User extends SingletonEntity<UserContent> {
  
  constructor() {
    super();
  }
  
  public create(password: string): Promise<UserContent> {
    return User.create(this, password);
  }
  
  public static create(user: User, password: string): Promise<UserContent> {
    return fetch(`${location.protocol}//api.${location.host}/user`, {
      method:  "POST",
      cache:   "no-cache",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body:    `${Object.entries(user.content).map(v => `${v[0]}=${v[1]}`).join("&")}&password=${password}`,
    })
    .then(res => res.json() as Promise<UserCreateResponse>)
    .then(res => res.code === 200 ? Promise.resolve(res.content) : Promise.reject(res));
  }
  
  public login(): Promise<UserContent>
  public login(password: string): Promise<UserContent>
  public login(password?: string): Promise<UserContent> {
    return password ? User.login(this, password) : User.login();
  }
  
  public static login(): Promise<UserContent>
  public static login(user: User, password: string): Promise<UserContent>
  public static login(user?: User, password?: string): Promise<UserContent> {
    return fetch(`${location.protocol}//api.${location.host}/user/login`, {
      method:  "POST",
      cache:   "no-cache",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body:    user && `${Object.entries(user.content).map(v => `${v[0]}=${v[1]}`).join("&")}&password=${password}`,
    })
    .then(res => res.json() as Promise<UserLoginResponse>)
    .then(res => {
      if (res.code === 200) {
        localStorage.jwt = res.content.jwt;
        return Promise.resolve(res.content.object);
      }
      return Promise.reject(res);
    });
  }
  
  public logout(): void {
    return User.logout();
  }
  
  public static logout(): void {
    localStorage.removeItem("jwt");
    localStorage.removeItem("basket");
  }
  
}

interface UserContent {
  id: string
  email: string
  username: string
  level: number
  time_created: Date
}

interface UserCreateResponse extends Response {
  content: UserContent
}


interface UserLoginResponse extends Response {
  content: {
    jwt: string
    object: UserContent
  }
}

export default User;
