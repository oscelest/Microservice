import App, {Container} from "next/app";
import React from "react";
import * as Redux from "redux";
import io from "socket.io-client";
import Basket from "../entities/Basket";
import User from "../entities/User";

class FrontendApp extends App {
  
  private store: Redux.Store<AppState, AppAction<AppActionTypes>> = Redux.createStore(
    (state = {}, action) => {
      if (action.type === "assign") return Object.assign({}, state, action.value);
      return state;
    },
    {}
  );
  
  public componentDidMount() {
    this.store.dispatch({
      type:  "assign",
      value: {
        socket: io("ws.localhost"),
        user:   new User(),
        basket: new Basket(),
      },
    });
    
    // this.store.getState().user.login()
    // .finally(() => this.store.getState().basket.find());
    
    // this.store.getState().socket.on("message", (message: any) => {
    //   console.log(message);
    // });
    //
    // this.store.getState().socket.on("exception", (message: any) => {
    //   console.log(message);
    // });
    //
    // console.log(this.store.getState());
  }
  
  public componentWillUnmount() {
    this.store.getState().socket.close();
  }
  
  public render() {
    const {Component, pageProps} = this.props;
    return (
      <Container>
        <Component store={this.store} {...pageProps}/>
      </Container>
    );
  }
}

export interface AppState {
  user: User
  basket: Basket
  socket: SocketIOClient.Socket
}

export interface AppResponse {
  code: number
  content: {[key: string]: any}
  time_complete: string
  time_started: string
  time_elapsed: string
}

export type AppAction<T extends AppActionTypes> =
  T extends "assign" ? AppActionAssign :
  AppActionBase<"refresh">

export type AppActionTypes = "assign" | "refresh";

interface AppActionBase<T> extends Redux.Action {
  type: T
}

interface AppActionAssign extends AppActionBase<"assign"> {
  value: Partial<AppState>
}

export default FrontendApp;
