import * as React from "react";
import Frame from "../components/Frame";
import Product from "../entities/Product";
import "../style.less";
import {GlobalState} from "./_app";
import _ from "lodash";

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
    const product = new Product();
    product.content.key = this.state.product.key;
    product.content.title = this.state.product.title;
    product.content.description = this.state.product.description;
    product.content.image = this.state.product.image;
    product.content.price = this.state.product.price;
    product.content.stock = this.state.product.stock;
    return product.create()
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
