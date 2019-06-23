import Link from "next/link";
import * as React from "react";
import Frame from "../components/Frame";
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
  
  private clickAddProduct(e: React.MouseEvent<HTMLButtonElement>, product: Product) {
    e.preventDefault();
    this.props.globals.basket.content.products.push(product);
  }
  
  private changeInput(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event.target.id);
    console.log(event.target.value);
    this.setState(Object.assign(this.state, {[event.target.id]: event.target.value}));
  }
  
  public render() {
    return (
      <Frame title="Products | Webshop" globals={this.props.globals}>
        <div id="products">
          {this.state.products.map((v, k) => {
            console.log(k, v);
            return (
              <Link href="/" key={k}>
                <div className="product">
                  <span className="title">{v.content.title}</span>
                  <span className="stock">{v.content.stock} left in stock</span>
                  <img src={v.content.image} alt={v.content.description}/>
                  <span className="price">{v.content.price / 100} DKK</span>
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
