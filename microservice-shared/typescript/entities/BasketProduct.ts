import * as TypeORM from "typeorm";
import Entity from "../services/Entity";
import Basket from "./Basket";
import Product from "./Product";

@TypeORM.Entity()
@TypeORM.Unique("basket_product", ["basket", "product"])
class BasketProduct extends Entity {
  
  @TypeORM.PrimaryGeneratedColumn("uuid")
  public readonly id: string;
  
  @TypeORM.Column({default: 0})
  public quantity: number;
  
  @TypeORM.CreateDateColumn()
  public readonly time_created: Date;
  
  @TypeORM.UpdateDateColumn()
  public readonly time_updated: Date;
  
  /* Relations */
  
  @TypeORM.ManyToOne(type => Basket, basket => basket.products, {eager: false, nullable: false})
  @TypeORM.JoinColumn({name: "basket"})
  public basket: Basket;
  
  @TypeORM.ManyToOne(type => Product, product => product.baskets, {eager: true, nullable: false})
  @TypeORM.JoinColumn({name: "product"})
  public product: Product;
  
}

namespace BasketProduct {
  
  export interface FindLastRequestBody {
    user: string
  }
  
  export interface CreateRequestBody {
    user: string
    flag_abandoned: boolean
    flag_completed: boolean
  }
  
  export interface UpdateRequestBody {
    id: Buffer
    user: Buffer
    flag_abandoned: boolean
    flag_completed: boolean
  }
  
}

export default BasketProduct;
