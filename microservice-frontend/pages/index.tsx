import _ from "lodash";
import * as React from "react";
import Frame from "../components/Frame";
import User from "../entities/User";
import "../style.less";
import {GlobalState} from "./_app";

class IndexPage extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: {
        signup: null,
        login:  null,
      },
      signup:  {
        email:    "",
        username: "",
        password: "",
        confirm:  "",
      },
      login:   {
        email:    "",
        password: "",
      },
      error:   {
        login:  0,
        signup: 0,
      },
    };
    this.changeInputSignup = this.changeInputSignup.bind(this);
    this.changeInputLogin = this.changeInputLogin.bind(this);
    this.clickButtonSignup = this.clickButtonSignup.bind(this);
    this.clickButtonLogin = this.clickButtonLogin.bind(this);
  }
  
  private changeInputSignup(event: React.ChangeEvent<HTMLInputElement>) {
    const attribute = (event.target.attributes.getNamedItem("formtarget") || {} as Attr).value;
    this.setState(Object.assign({}, this.state, {signup: Object.assign({}, this.state.signup, {[attribute]: event.target.value})}) as State);
  }
  
  private changeInputLogin(event: React.ChangeEvent<HTMLInputElement>) {
    const attribute = (event.target.attributes.getNamedItem("formtarget") || {} as Attr).value;
    this.setState(Object.assign({}, this.state, {login: Object.assign({}, this.state.login, {[attribute]: event.target.value})}) as State);
  }
  
  private clickButtonSignup() {
    if (this.state.signup.password !== this.state.signup.confirm) return this.setState(Object.assign({}, this.state, {error: Object.assign({}, this.state.error, {signup: 400})}) as State);
    
    const user = new User();
    user.content.username = this.state.signup.username;
    user.content.email = this.state.signup.email;
    
    const promise = user.create(this.state.signup.password);
    this.setState(Object.assign({}, this.state, {loading: Object.assign({}, this.state.loading, {signup: promise}), error: Object.assign({}, this.state.error, {signup: 0})}) as State);
    return promise
    .then(res => {
      this.props.globals.setState(Object.assign(this.props.globals, Object.assign({}, this.props.globals.user, {content: res})));
      const promise = user.login(this.state.signup.password);
      this.setState(Object.assign({}, this.state, {loading: Object.assign({}, this.state.loading, {signup: null, login: promise})}) as State);
      return promise;
    })
    .then(res => this.props.globals.setState(Object.assign(this.props.globals, Object.assign({}, this.props.globals.user, {content: res}))))
    .catch(err => this.setState(Object.assign({}, this.state, {error: Object.assign({}, this.state.error, {signup: err.code})}) as State))
    .finally(() => this.setState(Object.assign({}, this.state, {loading: Object.assign({}, this.state.loading, {signup: null, login: null})}) as State));
  }
  
  private clickButtonLogin() {
    const user = new User();
    user.content.email = this.state.login.email;
    const promise = user.login(this.state.login.password);
    this.setState(_.merge({}, this.state, {loading: {login: promise}, error: {login: 0}}));
    
    return promise
    .then(res => {
      this.props.globals.setState(_.merge(this.props.globals, {user: {content: res}} as GlobalState));
      return this.props.globals.basket.find()
      .then(res => this.props.globals.setState(_.merge(this.props.globals, {basket: {content: res}} as GlobalState)))
      .catch(err => {
        if (err.code !== 404) return Promise.resolve(null);
        return this.props.globals.basket.findLast();
      })
      .then(res => this.props.globals.setState(_.merge(this.props.globals, {basket: {content: res}} as GlobalState)))
      .catch(err => {
        if (err.code !== 404) return Promise.resolve(null);
        return this.props.globals.basket.create();
      })
      .then(res => this.props.globals.setState(_.merge(this.props.globals, {basket: {content: res}} as GlobalState)))
      .catch(() => Promise.resolve(null));
    })
    .catch(err => this.setState(_.merge({}, this.state, {error: {login: err.code}} as State)))
    .finally(() => this.setState(_.merge({}, this.state, {loading: {login: null}} as State)));
  }
  
  public render() {
    return (
      <Frame title="Home | Webshop" globals={this.props.globals}>
        <h1>Welcome to the webshop</h1>
        {this.props.globals.user.content.id
         ?
         <div id="reception">
           <div>Test</div>
         </div>
         :
         <div id="introduction">
           <div id="signup">
             <h2>If you are not signed up, then you can do so by using the form below:</h2>
            
             {this.state.error.signup ? <span>{this.state.error.signup}</span> : ""}
            
             <label htmlFor="signup_email">Email</label>
             <input type="email" id="signup_email" formTarget="email" value={this.state.signup.email || ""} onChange={this.changeInputSignup} autoComplete="off"
                    disabled={!!(this.state.loading.signup || this.state.loading.login)}/>
            
             <label htmlFor="signup_username">Username</label>
             <input type="text" id="signup_username" formTarget="username" value={this.state.signup.username || ""} onChange={this.changeInputSignup} autoComplete="off"
                    disabled={!!(this.state.loading.signup || this.state.loading.login)}/>
            
             <label htmlFor="signup_password">Password</label>
             <input type="password" id="signup_password" formTarget="password" value={this.state.signup.password || ""} onChange={this.changeInputSignup} autoComplete="new-password"
                    disabled={!!(this.state.loading.signup || this.state.loading.login)}/>
            
             <label htmlFor="signup_confirm">Confirm Password</label>
             <input type="password" id="signup_confirm" formTarget="confirm" value={this.state.signup.confirm || ""} onChange={this.changeInputSignup} autoComplete="new-password"
                    disabled={!!(this.state.loading.signup || this.state.loading.login)}/>
            
             <button onClick={this.clickButtonSignup} disabled={!!(this.state.loading.signup || this.state.loading.login)}>Signup</button>
            
             {!!this.state.loading.signup && <div className="loader"><img src="/static/loader.gif" alt=""/></div>}
           </div>
           <div id="login">
             <h2>... or if you're already a customer, you can log in here:</h2>
            
             {this.state.error.login ? <span>{this.state.error.login}</span> : ""}
            
             <label htmlFor="login_email">Email</label>
             <input type="email" id="login_email" formTarget="email" value={this.state.login.email || ""} autoComplete="username"
                    onChange={this.changeInputLogin} disabled={!!(this.state.loading.signup || this.state.loading.login)}/>
            
             <label htmlFor="login_password">Password</label>
             <input type="password" id="login_password" formTarget="password" value={this.state.login.password || ""} autoComplete="current-password"
                    onChange={this.changeInputLogin} disabled={!!(this.state.loading.signup || this.state.loading.login)}/>
            
             <button onClick={this.clickButtonLogin} disabled={!!(this.state.loading.signup || this.state.loading.login)}>Login</button>
            
             {!!this.state.loading.login && <div className="loader"><img src="/static/loader.gif" alt=""/></div>}
           </div>
         </div>
        }
      </Frame>
    );
  }
  
}

interface State {
  signup: {
    email: string
    username: string
    password: string
    confirm: string
  }
  login: {
    email: string
    password: string
  }
  loading: StateLoading
  error: StateErrors
}

interface StateLoading {
  signup?: Promise<any> | null
  login?: Promise<any> | null
}

interface StateErrors {
  signup?: number
  login?: number
}

interface Props {
  globals: GlobalState
}

export default IndexPage;
