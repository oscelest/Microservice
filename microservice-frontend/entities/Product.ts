import Entity, {EntityObject, JSONResponse} from "../services/Entity";

class Product extends Entity {
  
  public id: string;
  public key: string;
  public title: string;
  public description: string;
  public image: string;
  public price: number;
  public stock: number;
  public time_created: Date;
  public time_updated: Date;
  
  public static products: {[key: string]: Product} = {};
  
  constructor(object: EntityObject<Product>) {
    super();
    this.id = object.id;
    this.key = object.key;
    this.title = object.title;
    this.description = object.description;
    this.image = object.image;
    this.stock = object.stock;
    this.price = object.price;
    this.time_created = new Date(object.time_created || 0);
    this.time_updated = new Date(object.time_updated || 0);
  }
  
  public create() {
    return Product.create(this);
  }
  
  public static async find(start = 0, limit = 10): Promise<Product[]> {
    return await fetch(`${location.protocol}//api.${location.host}/product?start=${start}&limit=${limit}`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(async res => await res.json() as JSONResponse<EntityObject<Product>[]>)
    .then(async res => {
      if (res.code === 200) return res.content.map(object => Product.products[object.id] = new Product(object));
      throw res;
    });
  }
  
  public static async findById(id: string): Promise<Product> {
    return await fetch(`${location.protocol}//api.${location.host}/product/${id}`, {
      method:  "GET",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
    })
    .then(async res => await res.json() as JSONResponse<EntityObject<Product>>)
    .then(async res => {
      if (res.code === 200) return new Product(res.content);
      throw res;
    });
  }
  
  public static create(product: Product): Promise<Product> {
    return fetch(`${location.protocol}//api.${location.host}/product`, {
      method:  "POST",
      headers: {
        "Authorization": localStorage.getItem("jwt") || "",
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body:    Entity.toBody(product),
    })
    .then(async res => await res.json() as JSONResponse<EntityObject<Product>>)
    .then(async res => {
      if (res.code === 200) return new Product(res.content);
      throw res;
    });
  }
  
}

export interface ProductContent {
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

export default Product;
