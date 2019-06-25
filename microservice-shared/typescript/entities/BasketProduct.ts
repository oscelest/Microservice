import _ from "lodash";
import * as TypeORM from "typeorm";
import uuid from "uuid";
import Entity from "../services/Entity";
import Product from "./Product";
import Basket from "./Basket";

@TypeORM.Entity()
@TypeORM.Unique("basket_product", ["basket", "product"])
class BasketProduct extends Entity {
  
  @TypeORM.PrimaryColumn({type: "binary", length: 16, readonly: true, nullable: false})
  public readonly id: Buffer;
  
  @TypeORM.Column({default: 0})
  public quantity: number;
  
  @TypeORM.CreateDateColumn()
  public readonly time_created: Date;
  
  @TypeORM.UpdateDateColumn()
  public readonly time_updated: Date;
  
  /* Relations */
  
  @TypeORM.ManyToOne(type => Basket, basket => basket.products)
  @TypeORM.JoinColumn({name: "basket"})
  public basket: Basket;
  
  @TypeORM.ManyToOne(type => Product, product => product.baskets, {eager: true})
  @TypeORM.JoinColumn({name: "product"})
  public product: Product;
  
  /* Column Initialization */
  
  @TypeORM.BeforeInsert()
  private beforeInsert() {
    if (!this.id) _.set(this, "id", Buffer.from(uuid.v4().replace(/-/g, ""), "hex"));
  }
  
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
