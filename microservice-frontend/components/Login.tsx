import _ from "lodash";
import * as React from "react";
import Basket from "../entities/Basket";
import User from "../entities/User";
import {GlobalState} from "../pages/_app";

class LoginForm extends React.Component<Props, State> {
  
  private error_messages: {[key: string]: string} = {
    400: "Form not filled properly.",
    401: "Could not authorize user.",
    403: "Forbidden.",
    404: "Not found or server error.",
    500: "Internal server error.",
  };
  
  constructor(props: Props) {
    super(props);
    this.state = {
      error: 0,
      input: {email: "", password: ""},
    };
    this.changeInputEmail = this.changeInputEmail.bind(this);
    this.changeInputPassword = this.changeInputPassword.bind(this);
    this.clickButtonLogin = this.clickButtonLogin.bind(this);
  }
  
  private changeInputEmail(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(_.merge(this.state, {input: {email: event.target.value}}));
  }
  
  private changeInputPassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(_.merge(this.state, {input: {password: event.target.value}}));
  }
  
  private async clickButtonLogin() {
    try {
      this.setState(_.merge(this.state, {error: 0}));
      this.props.globals.setState(this.props.globals);
      new User(await User.login(this.state.input.email, this.state.input.password));
      localStorage.basket ? await Basket.findCurrent() || await Basket.findLast() : await Basket.findLast();
    }
    catch (exception) {
      this.setState(_.merge(this.state, {error: exception.code}));
    }
    this.props.globals.setState(this.props.globals);
  }
  
  public render() {
    return (
      <div id="login">
        {this.props.header ? <h2>{this.props.header}</h2> : ""}
        
        {this.state.error ? <h3>{this.error_messages[this.state.error]}</h3> : ""}
        
        <label htmlFor="login_email">Email</label>
        <input type="email" id="login_email" formTarget="email" value={this.state.input.email || ""} autoComplete="username"
               onChange={this.changeInputEmail} disabled={!!(User.Loading.signup || User.Loading.login)}/>
        
        <label htmlFor="login_password">Password</label>
        <input type="password" id="login_password" formTarget="password" value={this.state.input.password || ""} autoComplete="current-password"
               onChange={this.changeInputPassword} disabled={!!(User.Loading.signup || User.Loading.login)}/>
        
        <button onClick={this.clickButtonLogin} disabled={!!(User.Loading.signup || User.Loading.login)}>Login</button>
        
        {!!User.Loading.login && <div className="loader"><img src="/static/loader.gif" alt=""/></div>}
      </div>
    );
  }
  
}

interface State {
  error: number
  input: {
    email: string
    password: string
  }
}

interface Props {
  header?: string
  globals: GlobalState
}

export default LoginForm;
