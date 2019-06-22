import {AppResponse} from "../pages/_app";
import SingletonEntity from "../services/SingletonEntity";

class User extends SingletonEntity<UserContent> {
  
  constructor() {
    super();
  }
  
  public create(password: string) {
    return User.create(this, password);
  }
  
  public login(password: string) {
    return User.login(this, password);
  }
  
  public static create(user: User, password: string) {
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
    .then(res => res.code === 200 ? Promise.resolve(Object.assign(new User(), {content: res.content})) : Promise.reject(res));
  }
  
  public static login(user: User, password: string) {
    return fetch(`${location.protocol}//api.${location.host}/user/login`, {
      method:  "POST",
      cache:   "no-cache",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body:    `${Object.entries(user.content).map(v => `${v[0]}=${v[1]}`).join("&")}&password=${password}`,
    })
    .then(res => res.json() as Promise<UserLoginResponse>)
    .then(res => {
      if (res.code === 200 ) {
        localStorage.jwt = res.content.jwt;
        return Promise.resolve(Object.assign(new User(), {content: res.content.object}))
      }
      return Promise.reject(res)
    });
  }
  
}

interface UserContent {
  id: string
  email: string
  username: string
  level: number
  time_created: Date
}

interface UserCreateResponse extends AppResponse {
  content: UserContent
}


interface UserLoginResponse extends AppResponse {
  content: {
    jwt: string
    object: UserContent
  }
}

export default User;
