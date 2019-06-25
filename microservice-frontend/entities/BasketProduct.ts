import Entity, {EntityObject} from "../services/Entity";
import Product from "./Product";

class BasketProduct extends Entity {
  
  public id: string;
  public quantity: number;
  public product: Product;
  public time_created: Date;
  public time_updated: Date;
  
  constructor(object: EntityObject<BasketProduct>) {
    super();
    this.id = object.id;
    this.quantity = object.quantity;
    this.product = new Product(object.product);
    this.time_created = new Date(object.time_created);
    this.time_updated = new Date(object.time_updated);
    return this;
  }
  
}

export default BasketProduct;
