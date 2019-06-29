import Link from "next/link";
import * as React from "react";
import Frame from "../components/Frame";
import Basket from "../entities/Basket";
import Product from "../entities/Product";
import "../style.less";
import {GlobalState} from "./_app";

class ProductsPage extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {products: []};
    this.changeInput = this.changeInput.bind(this);
    this.clickAddProduct = this.clickAddProduct.bind(this);
  }
  
  public componentDidMount(): void {
    const promise = Product.find(0, 10)
    .then(res => this.setState(Object.assign(this.state, {products: res})));
    
    this.setState(Object.assign(this.state, {product_promise: promise}));
  }
  
  private async clickAddProduct(e: React.MouseEvent<HTMLButtonElement>, product: Product) {
    e.preventDefault();
    try {
      await Basket.setProduct(product, (Basket.findBasketProduct(product.id) || {quantity: 0}).quantity + 1);
    }
    catch (exception) {
      console.error("addProductError", exception);
    }
    this.props.globals.setState(this.props.globals);
  }
  
  private changeInput(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(Object.assign(this.state, {[event.target.id]: event.target.value}));
  }
  
  public render() {
    // TODO: CREATE UPDATE AND REMOVE PRODUCT UI AND CALLS
    return (
      <Frame title="Products | Webshop" globals={this.props.globals}>
        <div id="products">
          {this.state.products.map(v => Product.products[v.id]).map((v, k) => {
            return (
              <Link href="/" key={k}>
                <div className="product">
                  <span className="title">{v.title}</span>
                  <span className="stock">{v.stock} left in stock</span>
                  <img src={v.image} alt={v.description}/>
                  <span className="price">{v.price / 100} DKK</span>
                  <button onClick={e => this.clickAddProduct(e, v)}>Add to basket</button>
                </div>
              </Link>
            );
          })}
        </div>
      </Frame>
    );
  }
  
}

interface Props {
  globals: GlobalState
}

interface State {
  product_promise?: Promise<any>;
  products: Product[];
  
  key?: string
  title?: string
  description?: string
  image?: string
  price?: number
  stock?: number
}

export default ProductsPage;
