import * as React from "react";
import Frame from "../components/Frame";
import Product from "../entities/Product";
import "../style.less";
import {GlobalState} from "./_app";
import _ from "lodash";
import uuid from "uuid";

class ProductsPage extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {
      product: {key: "", title: "", description: "", image: "", price: 0, stock: 0},
    };
    this.changeInput = this.changeInput.bind(this);
    this.clickAddProduct = this.clickAddProduct.bind(this);
  }
  
  private clickAddProduct(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    return Product.create(new Product({
      id: uuid.v4(),
      key: this.state.product.key,
      title: this.state.product.title,
      description: this.state.product.description,
      image: this.state.product.image,
      price: this.state.product.price,
      stock: this.state.product.stock,
      time_created: new Date(),
      time_updated: new Date(),
    }))
    .then(() => this.setState(Object.assign(this.state, {product: {key: "", title: "", description: "", image: "", price: 0, stock: 0}}) as State));
  }
  
  private changeInput(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(_.merge(this.state, {product: {[event.target.id]: event.target.value}}) as State);
  }
  
  public render() {
    return (
      <Frame title="Admin | Webshop" globals={this.props.globals}>
        <div>
          <label htmlFor="key">Key</label>
          <input id="key" type="text" value={this.state.product.key} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={this.state.product.title} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <input id="description" type="text" value={this.state.product.description} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="image">Image</label>
          <input id="image" type="text" value={this.state.product.image} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="price">Price</label>
          <input id="price" type="number" value={this.state.product.price} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="stock">Stock</label>
          <input id="stock" type="number" value={this.state.product.stock} onChange={this.changeInput}/>
        </div>
        <button onClick={this.clickAddProduct}>Add a product</button>
      </Frame>
    );
  }
  
}

interface Props {
  globals: GlobalState
}

interface State {
  product: {
    key: string
    title: string
    description: string
    image: string
    price: number
    stock: number
  }
}

export default ProductsPage;
