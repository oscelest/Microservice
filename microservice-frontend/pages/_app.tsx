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
  
  constructor(props: Props) {
    super(props);
    this.state = {
      ready:    false,
      user:     User.Instance,
      basket:   Basket.Instance,
      socket:   io("ws.localhost"),
      setState: (state, callback) => this.setState(state, callback),
    };
  }
  
  public async componentDidMount() {
    if (localStorage.jwt) {
      try {
        Object.assign(this.state.user, await User.login());
        this.state.socket.emit("message", {
          source:     "frontend",
          method:     "authorize",
          target:     "websocket",
          parameters: [this.state.socket.id, localStorage.jwt],
          id:         uuid.v4(),
        } as IMSC.WSMessage<IMSC.WS.WebsocketMessage>);
        this.state.socket.on("update_product", (message: IMSC.WSMessage<IMSC.WS.FrontendMessage>) => {
          Product.products[message.parameters[0].id] = new Product(message.parameters[0]);
          this.setState(this.state);
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
