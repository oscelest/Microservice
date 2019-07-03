import App, {AppProps, Container} from "next/app";
import React from "react";
import io from "socket.io-client";
import uuid from "uuid";
import IMSC from "../../microservice-shared/typescript/typings/IMSC";
import Basket from "../entities/Basket";
import Product from "../entities/Product";
import User from "../entities/User";

class FrontendApp extends App<Props> {
  
  public state: GlobalState;
  private static Instance: FrontendApp;
  
  private WebsocketMethods: IMSC.WS.FrontendMessage = {
    async product_create(product: any) {
      Product.products[product.id] = new Product(product);
      FrontendApp.Instance.setState(FrontendApp.Instance.state);
    },
    async product_update(product: any) {
      Product.products[product.id] = new Product(product);
      FrontendApp.Instance.setState(FrontendApp.Instance.state);
      await Basket.update();
    },
    async product_remove(product_id: string) {
      delete Product.products[product_id];
      FrontendApp.Instance.setState(FrontendApp.Instance.state);
      await Basket.update();
    },
  };
  
  constructor(props: Props) {
    super(props);
    this.state = {
      ready:    false,
      user:     User.Instance,
      basket:   Basket.Instance,
      socket:   io("ws.localhost"),
      setState: (state, callback) => this.setState(state, callback),
    };
    FrontendApp.Instance = this;
  }
  
  public async componentDidMount() {
    if (localStorage.jwt) {
      try {
        Object.assign(this.state.user, await User.login());
        
        this.state.socket.emit("message", {
          id:         uuid.v4(),
          method:     "authorize",
          parameters: [this.state.socket.id, localStorage.jwt],
        } as IMSC.WSMessage<IMSC.WS.WebsocketMessage>);
        
        this.state.socket.on("message", (message: IMSC.WSMessage<IMSC.WS.FrontendMessage>) => {
          (this.WebsocketMethods[message.method] as Function).apply(message, message.parameters);
          console.log(message);
        })
      }
      catch (e) {
        User.Instance.id = "";
        User.Instance.email = "";
        User.Instance.username = "";
        User.Instance.level = 0;
        User.Instance.time_login = new Date(0);
        User.Instance.time_created = new Date(0);
        User.logout();
      }
    }
    if (User.Instance.id) {
      if (localStorage.basket) {
        await Basket.findCurrent() || await Basket.findLast()
      }
      else {
        await Basket.findLast()
      }
    }
    else {
      await Basket.findCurrent()
    }
    this.setState(Object.assign(this.state, {ready: true}));
  }
  
  public componentWillUnmount() {
    this.state.socket.close();
  }
  
  public render() {
    const {Component, pageProps} = this.props;
    return (
      <Container>
        {
          this.state.ready
          ? <Component globals={this.state} {...pageProps}/>
          : <div className="loader"><img src="/static/loader.gif" alt=""/></div>
        }
      </Container>
    );
  }
  
}

interface Props extends AppProps {

}

export interface GlobalState {
  ready: boolean
  user: User
  basket: Basket
  socket: SocketIOClient.Socket
  
  setState<K extends keyof GlobalState, R extends (Pick<GlobalState, K> | GlobalState | null)>(s: ((ps: Readonly<GlobalState>, p: Readonly<Props>) => R) | R, cb?: () => void): void;
}

export default FrontendApp;
