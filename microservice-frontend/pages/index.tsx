import * as React from "react";
import Frame from "../components/Frame";
import LoginForm from "../components/Login";
import SignupForm from "../components/Signup";
import "../style.less";
import {GlobalState} from "./_app";

class IndexPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }
  
  public render() {
    // TODO: CREATE BASKET PAGE
    return (
      <Frame title="Home | Webshop" globals={this.props.globals}>
        <h1>Welcome to the webshop</h1>
        {!this.props.globals.user.id
         ?
         <div id="introduction">
           <SignupForm globals={this.props.globals} header="If you are not signed up, then you can do so by using the form below:"/>
           <LoginForm globals={this.props.globals} header="... or if you're already a customer, you can log in here:"/>
         </div>
         :
         null
        }
      </Frame>
    );
  }
  
}

interface State {
}

interface Props {
  globals: GlobalState
}

export default IndexPage;
