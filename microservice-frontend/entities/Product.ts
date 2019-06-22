import {AppResponse} from "../pages/_app";
import Entity from "../services/Entity";

class Product extends Entity<ProductContent> {
  
  constructor() {
    super();
  }
  
  public create() {
    return Product.create(this);
  }
  
  public static find(start = 0, limit = 10): Promise<Product[]> {
    return fetch(`${location.protocol}//api.${location.host}/product?start=${start}&limit=${limit}`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(res => res.json() as Promise<ProductFindResponse>)
    .then(res => res.code === 200 ? Promise.resolve(res.content.map(v => Object.assign(new Product(), {content: v}))) : Promise.reject(res))
  }
  
  public static findById(id: string) {
    return fetch(`${location.protocol}//api.${location.host}/product/${id}`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(res => {
      if (res.status === 200) return res.json() as Promise<ProductFindByIdResponse>;
      return Promise.reject(res);
    })
    .catch(err => {
      console.log(err);
      return Promise.reject(err);
    });
  }
  
  public static create(product: Product) {
    return fetch(`${location.protocol}//api.${location.host}/product`, {
      method:  "POST",
      body:    Object.entries(product.content).map(v => `${v[0]}=${v[1]}`).join("&"),
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(res => res.json() as Promise<ProductCreateResponse>)
    .then(res => res.code === 200 ? Promise.resolve(res) : Promise.reject(res))
  }
  
}

interface ProductContent {
  id: string;
  key: string
  title: string
  description: string
  image: string
  price: number
  stock: number
  time_created: Date;
  time_updated: Date;
}

interface ProductFindResponse extends AppResponse {
  content: ProductContent[]
}

interface ProductCreateResponse extends AppResponse {
  content: ProductContent
}

interface ProductFindByIdResponse extends AppResponse {
  content: ProductContent
}

export default Product;
