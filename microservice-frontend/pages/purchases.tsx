import * as React from "react";
import Frame from "../components/Frame";
import Checkout from "../entities/Checkout";
import "../style.less";
import {GlobalState} from "./_app";

class ProductsPage extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {
      error:   0,
      loading: false,
      product: {key: "", title: "", description: "", image: "", price: 0, stock: 0},
    };
  }
  
  public async componentDidMount() {
    this.setState(Object.assign(this.state, {loading: true}));
    await Checkout.find();
    this.setState(Object.assign(this.state, {loading: false}));
  }
  
  public render() {
    return (
      <Frame title="Purchases | Webshop" globals={this.props.globals}>
        <div id="purchases">
          {Object.values(Checkout.checkouts).map((checkout, key) => {
            return (
              <div className="purchase" key={key}>
                <div className="header">
                  <div>{checkout.time_created.toUTCString()}</div>
                  <div>{(checkout.price / 100).toFixed(2)} DKK</div>
                </div>
                {checkout.basket.products.map((basket_product, key) => (
                  <div className="product" key={key}>{basket_product.quantity} - {basket_product.product.title}</div>
                ))}
              </div>
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
  error: number
  loading: boolean
  product: {
    key: string
    title: string
    description: string
    image: string
    stock: number
    price: number
  }
}

export default ProductsPage;
