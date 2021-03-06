import Head from "next/head";
import Link from "next/link";
import * as React from "react";
import User from "../entities/User";
import {GlobalState} from "../pages/_app";

class Frame extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.clickButtonLogout = this.clickButtonLogout.bind(this);
  }
  
  private clickButtonLogout() {
    User.logout();
    this.props.globals.setState(Object.assign(this.props.globals, {user: User.Instance}));
  }
  
  public render() {
    return [
      <Head key="Head">
        <title>{this.props.title}</title>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
      </Head>,
      <header key="header">
        <nav>
          <div id="links">
            <Link href="/">
              <button>Home</button>
            </Link>
            <Link href="/products">
              <button>Products</button>
            </Link>
            <Link href="/basket">
              <button>Basket</button>
            </Link>
          </div>
          <div id="user">
            {
              this.props.globals.user.level > 0
              ?
              <Link href="/admin">
                <button>Admin</button>
              </Link>
              :
              null
            }
            {
              this.props.globals.user.id
              ?
              [
                <Link href="/purchases" key="1">
                  <button>Purchases</button>
                </Link>,
                <button key="0" onClick={this.clickButtonLogout}>Logout</button>,
              ]
              :
              <Link href="/">
                <button>Login</button>
              </Link>
            }
          </div>
        </nav>
      </header>,
      this.props.children,
    ];
  }
  
}

interface State {
  
}

interface Props {
  title?: string
  page?: string
  globals: GlobalState
}

export default Frame;
