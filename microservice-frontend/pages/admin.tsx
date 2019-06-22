import * as React from "react";
import Redux from "redux";
import Frame from "../components/Frame";
import Product from "../entities/Product";
import "../style.less";
import {AppAction, AppActionTypes, AppState} from "./_app";

class ProductsPage extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {};
    this.changeInput = this.changeInput.bind(this);
    this.clickAddProduct = this.clickAddProduct.bind(this);
  }
  
  private clickAddProduct(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const product = new Product();
    product.content.key = this.state.key || "";
    product.content.title = this.state.title || "";
    product.content.description = this.state.description || "";
    product.content.image = this.state.image || "";
    product.content.price = this.state.price || 0;
    product.content.stock = this.state.stock || 0;
    return product.create()
    .then(() => Product.find());
  }
  
  private changeInput(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event.target.id);
    console.log(event.target.value);
    this.setState(Object.assign(this.state, {[event.target.id]: event.target.value}));
  }
  
  public render() {
    return (
      <Frame title="Admin | Webshop" user={this.props.store.getState().user}>
        <div>
          <label htmlFor="key">Key</label>
          <input id="key" type="text" value={this.state.key || ""} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={this.state.title || ""} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <input id="description" type="text" value={this.state.description || ""} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="image">Image</label>
          <input id="image" type="text" value={this.state.image || ""} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="price">Price</label>
          <input id="price" type="number" value={this.state.price || 0} onChange={this.changeInput}/>
        </div>
        <div>
          <label htmlFor="stock">Stock</label>
          <input id="stock" type="number" value={this.state.stock || 0} onChange={this.changeInput}/>
        </div>
        <button onClick={this.clickAddProduct}>Add a product</button>
      </Frame>
    );
  }
  
}

interface Props {
  store: Redux.Store<AppState, AppAction<AppActionTypes>>
}

interface State {
  key?: string
  title?: string
  description?: string
  image?: string
  price?: number
  stock?: number
}

export default ProductsPage;
