import * as React from "react";
import Frame from "../components/Frame";
import LoginForm from "../components/Login";
import SignupForm from "../components/Signup";
import Basket from "../entities/Basket";
import "../style.less";
import BasketProduct from "../entities/BasketProduct";
import {GlobalState} from "./_app";

class IndexPage extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {};
    this.clickSetProduct = this.clickSetProduct.bind(this);
  }
  
  private async clickSetProduct(e: React.MouseEvent<HTMLDivElement>, basket_product: BasketProduct, quantity: number) {
    e.preventDefault();
    try {
      await Basket.setProduct(basket_product.product, basket_product.quantity + quantity);
    }
    catch (exception) {
      console.error("addProductError", exception);
    }
    this.props.globals.setState(this.props.globals);
  }

  private async clickDeleteProduct(e: React.MouseEvent<HTMLButtonElement>, basket_product: BasketProduct) {
    e.preventDefault();
    try {
      await Basket.setProduct(basket_product.product, 0);
    }
    catch (exception) {
      console.error("addProductError", exception);
    }
    this.props.globals.setState(this.props.globals);
  }
  
  
  public render() {
    console.log(this.props.globals);
    return (
      <Frame title="Home | Webshop" globals={this.props.globals}>
        <h1>Welcome to the webshop</h1>
        {this.props.globals.user.id
         ?
         <div id="reception">
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
                     <div className="plus"  onClick={e => this.clickSetProduct(e, v, 1)}>➕</div>
                     <div className="count">{v.quantity}</div>
                     <div className="minus" onClick={e => this.clickSetProduct(e, v, -1)}>➖</div>
                   </div>
                   <button onClick={e => this.clickDeleteProduct(e, v)}>Remove</button>
                 </div>
               ))
             }
             <button disabled={Basket.Instance.products.length === 0}>Purchase</button>
           </div>
           
         </div>
         :
         <div id="introduction">
           <SignupForm globals={this.props.globals} header="If you are not signed up, then you can do so by using the form below:"/>
           <LoginForm globals={this.props.globals} header="... or if you're already a customer, you can log in here:"/>
         </div>
        }
      </Frame>
    );
  }
  
}

interface State {

}

interface Props {
  globals: GlobalState
}

export default IndexPage;
