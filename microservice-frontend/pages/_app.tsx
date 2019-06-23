import App, {AppProps, Container} from "next/app";
import React from "react";
import io from "socket.io-client";
import uuid from "uuid";
import IMSC from "../../microservice-shared/typescript/typings/IMSC";
import Basket from "../entities/Basket";
import User from "../entities/User";

class FrontendApp extends App<Props> {
  
  public state: GlobalState;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      ready:  false,
      user:   new User(),
      basket: new Basket(),
      socket: io("ws.localhost"),
      
      setState: (state, callback) => this.setState(state, callback),
    };
  }
  
  public componentDidMount() {
    if (!localStorage.jwt) return this.setState(Object.assign({}, this.state, {ready: true}));
    return Promise.all([
      this.state.user.login()
      .then(res => Object.assign(this.state.user.content, res))
      .catch(() => this.state.user.logout()),
    ])
    .then(() => Promise.all([
      this.state.basket.find()
      .catch(err => {
        if (err.code !== 404) return Promise.resolve(Object.assign(this.state.basket.content, {products: []}));
        return this.state.basket.create()
        .then(res => Promise.resolve(Object.assign(this.state.basket.content, res)))
        .catch(() => Promise.resolve(Object.assign(this.state.basket.content, {products: []})));
      }),
      this.state.socket.emit("message", {
        source:     "frontend",
        method:     "authorize",
        target:     "websocket",
        parameters: [this.state.socket.id, localStorage.jwt],
        id:         uuid.v4(),
      } as IMSC.Message<IMSC.WS.WebsocketMessage>),
    ]))
    .then(() => this.setState(Object.assign({}, this.state, {ready: true})));
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

export interface Response {
  code: number
  content: {[key: string]: any}
  time_complete: string
  time_started: string
  time_elapsed: string
}

export default FrontendApp;
