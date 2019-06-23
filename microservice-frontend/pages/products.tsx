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
      <Frame title="Products | Webshop" globals={this.props.globals}>
        <div id="products">
          {this.state.products.map((v, k) => {
            console.log(k, v);
            return (<div className="product" key={k}>
              title
              <span>{v.content.title}</span>
              <span>Price: {v.content.price / 100} DKK</span>
              <span>Stock: {v.content.stock}</span>
            </div>);
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
