import _ from "lodash";
import * as React from "react";
import Basket from "../entities/Basket";
import User from "../entities/User";
import {GlobalState} from "../pages/_app";

class SignupForm extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {
      error: 0,
      input: {email: "", username: "", password: "", confirm: ""},
    };
    this.changeInputEmail = this.changeInputEmail.bind(this);
    this.changeInputUsername = this.changeInputUsername.bind(this);
    this.changeInputPassword = this.changeInputPassword.bind(this);
    this.changeInputConfirm = this.changeInputConfirm.bind(this);
    this.clickButtonSignup = this.clickButtonSignup.bind(this);
  }
  
  private changeInputEmail(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(_.merge(this.state, {input: {email: event.target.value}}));
  }
  
  private changeInputUsername(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(_.merge(this.state, {input: {username: event.target.value}}));
  }
  
  private changeInputPassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(_.merge(this.state, {input: {password: event.target.value}}));
  }
  
  private changeInputConfirm(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(_.merge(this.state, {input: {confirm: event.target.value}}));
  }
  
  private async clickButtonSignup() {
    if (this.state.input.password !== this.state.input.confirm) return this.setState(_.merge(this.state, {error: 400}));
    try {
      this.setState(_.merge(this.state, {error: 0}));
      this.props.globals.setState(this.props.globals);
      await User.create(this.state.input.email, this.state.input.username, this.state.input.password);
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
      <div id="signup">
        {this.props.header ? <h2>{this.props.header}</h2> : ""}
        
        {this.state.error ? <span>{this.state.error}</span> : ""}
        
        <label htmlFor="signup_email">Email</label>
        <input type="email" id="signup_email" formTarget="email" value={this.state.input.email || ""} onChange={this.changeInputEmail} autoComplete="off"
               disabled={!!(User.Loading.signup || User.Loading.login)}/>
        
        <label htmlFor="signup_username">Username</label>
        <input type="text" id="signup_username" formTarget="username" value={this.state.input.username || ""} onChange={this.changeInputUsername} autoComplete="off"
               disabled={!!(User.Loading.signup || User.Loading.login)}/>
        
        <label htmlFor="signup_password">Password</label>
        <input type="password" id="signup_password" formTarget="password" value={this.state.input.password || ""} onChange={this.changeInputPassword} autoComplete="new-password"
               disabled={!!(User.Loading.signup || User.Loading.login)}/>
        
        <label htmlFor="signup_confirm">Confirm Password</label>
        <input type="password" id="signup_confirm" formTarget="confirm" value={this.state.input.confirm || ""} onChange={this.changeInputConfirm} autoComplete="new-password"
               disabled={!!(User.Loading.signup || User.Loading.login)}/>
        
        <button onClick={this.clickButtonSignup} disabled={!!(User.Loading.signup || User.Loading.login)}>Signup</button>
        
        {!!User.Loading.signup && <div className="loader"><img src="/static/loader.gif" alt=""/></div>}
      </div>
    );
  }
  
}

interface State {
  error: number
  input: {
    email: string
    username: string
    password: string
    confirm: string
  }
}

interface Props {
  header?: string
  globals: GlobalState
}

export default SignupForm;
