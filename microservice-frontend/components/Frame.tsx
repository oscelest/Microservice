import Head from "next/head";
import Link from "next/link";
import * as React from "react";
import {GlobalState} from "../pages/_app";

class Frame extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.clickButtonLogout = this.clickButtonLogout.bind(this);
  }
  
  private clickButtonLogout() {
    this.props.globals.user.logout();
    this.props.globals.setState(Object.assign(this.props.globals, Object.assign(this.props.globals.user, {content: {}})));
  }
  
  public render() {
    return [
      <Head key="Head">
        <title>{this.props.title}</title>
        <meta charSet='utf-8'/>
        <meta name='viewport' content='initial-scale=1.0, width=device-width'/>
      </Head>,
      <header key="header">
        <nav>
          <div id="links">
            <Link href='/'><a>Home</a></Link>
            <Link href='/products'><a>Products</a></Link>
          </div>
          <div id="user">
            {this.props.globals.user.content.level > 0 ? <Link href='/admin'><a>Admin</a></Link> : ""}
            {this.props.globals.user.content.id ? <button onClick={this.clickButtonLogout}>Logout</button> : <Link href='/login'>
              <button>Login</button>
            </Link>}
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
