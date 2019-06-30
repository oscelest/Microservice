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
    this.state = {
      loading: false
    };
    this.changeInput = this.changeInput.bind(this);
    this.clickAddProduct = this.clickAddProduct.bind(this);
  }
  
  public async componentDidMount() {
    this.setState(Object.assign(this.state, {loading: true}));
    await Product.find();
    this.setState(Object.assign(this.state, {loading: false}));
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
    return (
      <Frame title="Products | Webshop" globals={this.props.globals}>
        <div id="products">
          {Object.values(Product.products).map((v, k) => {
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
  loading: boolean
}

export default ProductsPage;
