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
  
  public static async find(start = 0, limit = 1000): Promise<Product[] | JSONResponse<any>> {
    try {
      const response = await fetch(`${location.protocol}//api.${location.host}/product?start=${start}&limit=${limit}`, {
        method:  "GET",
        headers: {
          "Authorization": localStorage.getItem("jwt") || "",
          "Content-Type":  "application/x-www-form-urlencoded",
        },
      });
      const object: JSONResponse<EntityObject<Product>[]> = await response.json();
      if (object.code === 200) return object.content.map(object => Product.products[object.id] = new Product(object));
      return object;
    }
    catch (exception) {
      return {code: 500, content: {}, time_started: new Date().toISOString(), time_complete: new Date().toISOString(), time_elapsed: "0ms"} as JSONResponse<any>;
    }
  }
  
  public static async create(key: string, title: string, description: string, image: string, price: number, stock: number): Promise<Product | JSONResponse<any>> {
    try {
      key = encodeURIComponent(key);
      title = encodeURIComponent(title);
      description = encodeURIComponent(description);
      image = encodeURIComponent(image);
      const response = await fetch(`${location.protocol}//api.${location.host}/product`, {
        method:  "POST",
        headers: {
          "Authorization": localStorage.getItem("jwt") || "",
          "Content-Type":  "application/x-www-form-urlencoded",
        },
        body:    `key=${key}&title=${title}&description=${description}&image=${image}&price=${price}&stock=${stock}`,
      });
      const object: JSONResponse<EntityObject<Product>> = await response.json();
      if (object.code === 200) return new Product(object.content);
      return object;
    }
    catch (exception) {
      return {code: 500, content: {}, time_started: new Date().toISOString(), time_complete: new Date().toISOString(), time_elapsed: "0ms"} as JSONResponse<any>;
    }
  }
  
  public static async update(product: Product): Promise<Product | JSONResponse<any>> {
    try {
      const response = await fetch(`${location.protocol}//api.${location.host}/product/${product.id}`, {
        method:  "PUT",
        headers: {
          "Authorization": localStorage.getItem("jwt") || "",
          "Content-Type":  "application/x-www-form-urlencoded",
        },
        body:    Entity.toBody(product),
      });
      const object: JSONResponse<EntityObject<Product>> = await response.json();
      if (object.code === 200) return new Product(object.content);
      return object;
    }
    catch (exception) {
      return {code: 500, content: {}, time_started: new Date().toISOString(), time_complete: new Date().toISOString(), time_elapsed: "0ms"} as JSONResponse<any>;
    }
  }
  
  public static async remove(product_id: string): Promise<any | JSONResponse<any>> {
    try {
      const response = await fetch(`${location.protocol}//api.${location.host}/product/${product_id}`, {
        method:  "DELETE",
        headers: {
          "Authorization": localStorage.getItem("jwt") || "",
          "Content-Type":  "application/x-www-form-urlencoded",
        },
      });
      const object: JSONResponse<any> = await response.json();
      if (object.code === 200) return object.content;
      return object;
    }
    catch (exception) {
      return {code: 500, content: {}, time_started: new Date().toISOString(), time_complete: new Date().toISOString(), time_elapsed: "0ms"} as JSONResponse<any>;
    }
  }
  
}

export default Product;
