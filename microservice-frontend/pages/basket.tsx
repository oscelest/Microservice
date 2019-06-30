import * as React from "react";
import Frame from "../components/Frame";
import Basket from "../entities/Basket";
import BasketProduct from "../entities/BasketProduct";
import Checkout from "../entities/Checkout";
import User from "../entities/User";
import "../style.less";
import {GlobalState} from "./_app";

class ProductsPage extends React.Component<Props, State> {
  
  private error_messages: {[key: string]: string} = {
    500: "Internal server error.",
  };
  
  constructor(props: Props) {
    super(props);
    this.state = {
      error: 0,
    };
    this.clickSetProduct = this.clickSetProduct.bind(this);
    this.clickDeleteProduct = this.clickDeleteProduct.bind(this);
    this.clickCheckout = this.clickCheckout.bind(this);
  }
  
  private async clickSetProduct(e: React.MouseEvent<HTMLDivElement>, basket_product: BasketProduct, quantity: number) {
    e.preventDefault();
    try {
      await Basket.setProduct(basket_product.product, basket_product.quantity + quantity);
    }
    catch (exception) {
      this.setState(Object.assign(this.state, {error: 500}));
    }
    this.props.globals.setState(this.props.globals);
  }
  
  private async clickDeleteProduct(e: React.MouseEvent<HTMLButtonElement>, basket_product: BasketProduct) {
    e.preventDefault();
    try {
      await Basket.setProduct(basket_product.product, 0);
    }
    catch (exception) {
      return this.setState(Object.assign(this.state, {error: 500}));
    }
    this.props.globals.setState(this.props.globals);
  }
  
  private async clickCheckout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      const response = await Checkout.create();
      if (!(response instanceof Checkout)) {
        this.setState(Object.assign(this.state, {error: response.code}));
      }
      else {
        localStorage.removeItem("basket");
        Basket.Instance.id = "";
        Basket.Instance.time_created = new Date(0);
        Basket.Instance.time_updated = new Date(0);
        Basket.Instance.flag_abandoned = false;
        Basket.Instance.flag_completed = false;
        Basket.Instance.user = User.Instance;
        Basket.Instance.products.length = 0;
        this.props.globals.setState(this.props.globals);
        alert("Purchase completed.");
      }
    }
    catch (exception) {
      this.setState(Object.assign(this.state, {error: 500}));
    }
  }
  
  public render() {
    return (
      <Frame title="Admin | Webshop" globals={this.props.globals}>
        <div id="reception">
          {this.state.error ? <h3 className="error">{this.error_messages[this.state.error]}</h3> : ""}
          <div id="basket">
            <h2>Your current basket:</h2>
            {
              Basket.Instance.products.map((v, k) => (
                <div className="product" key={k}>
                  <img src={v.product.image} alt="a picture of the product"/>
                  <div className="info">
                    <div className="name">{v.product.title}</div>
                    <div className="price">Per piece: {v.product.price / 100} DKK</div>
                    <div className="total-price">Total: {v.quantity * v.product.price / 100} DKK</div>
                  </div>
                  
                  <div className="quantity">
                    <div className="plus" onClick={e => this.clickSetProduct(e, v, 1)}>➕</div>
                    <div className="count">{v.quantity}</div>
                    <div className="minus" onClick={e => this.clickSetProduct(e, v, -1)}>➖</div>
                  </div>
                  <button onClick={e => this.clickDeleteProduct(e, v)}>Remove</button>
                </div>
              ))
            }
            <button disabled={Basket.Instance.products.length === 0} onClick={this.clickCheckout}>Purchase</button>
          </div>
        </div>
      </Frame>
    );
  }
  
}

interface Props {
  globals: GlobalState
}

interface State {
  error: number
}

export default ProductsPage;
