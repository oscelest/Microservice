import Head from "next/head";
import Link from "next/link";
import * as React from "react";
import User from "../entities/User";

// import {AppStore} from "../pages/_app";

class Frame extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
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
            {this.props.user && this.props.user.content.level > 0 ? <Link href='/admin'><a>Admin</a></Link> : ""}
            {this.props.user && this.props.user.content.level > 0 ? <span>{this.props.user.content.username}</span> : <Link href='/login'><a>Login</a></Link>}
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
  user: User
}

export default Frame;
