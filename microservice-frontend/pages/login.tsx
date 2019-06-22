import * as React from "react";
import Redux from "redux";
import Input from "../components/Input";
import Frame from "../components/Frame";
import {AppAction, AppActionTypes, AppState} from "./_app";

class LoginPage extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {};
    this.changeUsername = this.changeUsername.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.clickLoginHandler = this.clickLoginHandler.bind(this);
  }
  
  public componentDidMount(): void {
    console.log("Mounted props", this.props);
    console.log("Mounted state", this.state);
  }
  
  private changeUsername(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(Object.assign(this.state, {email: event.target.value, username: event.target.value}));
  }
  
  private changePassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(Object.assign(this.state, {password: event.target.value}));
  }
  
  private clickLoginHandler() {
    // AppStore.getState().user.login(this.state.username || "", this.state.password || "")
    // .then(res => {
    //   console.log("Login result", res);
    //   AppStore.dispatch({type: "refresh"});
    // })
    // .catch(err => {
    //   console.log(err);
    // });
  }
  
  public render() {
    return (
      <Frame title="Login" user={this.props.store.getState().user}>
        <label htmlFor="username">Username:</label>
        <Input id="username" onChange={this.changeUsername}/>
        <label htmlFor="password">Password:</label>
        <Input id="password" type={"password"} onChange={this.changePassword}/>
        <button onClick={this.clickLoginHandler}>Log In</button>
      </Frame>
    );
  }
  
}

interface Props {
  store: Redux.Store<AppState, AppAction<AppActionTypes>>
}

interface State {
  username?: string
  password?: string
}

export default LoginPage;
