import _ from "lodash";

class Exception extends Error {
  
  public readonly source: string;
  public readonly type: string;
  public readonly message: string;
  public readonly content: any;
  public readonly original_message: string;
  public readonly stack_trace: string[];
  
  constructor(message?: string, content?: any) {
    super();
    this.message = message || "Error message missing.";
    if (content instanceof Error) {
      this.original_message = content.message;
      this.stack_trace = _.map(_.tail(_.split(content.stack, /\n/g)), s => s.replace(/^\s+/, ""));
    }
    else {
      this.content = content;
      this.stack_trace = _.map(_.tail(_.split(this.stack, /\n/g)), s => s.replace(/^\s+/, ""));
    }
    delete this.stack;
  }
  
}

namespace Exception {
  
  export class SocketChannelTimeoutException extends Exception {
    constructor(message?: string, content?: any) {
      super(message, content);
    }
  }
  
  export class UnauthorizedRequestException extends Exception {
    constructor(message?: string, content?: any) {
      super(message, content);
    }
  }
  
  export class MalformedRequestException extends Exception {
    constructor(message?: string, content?: any) {
      super(message, content);
    }
  }
  
}


export default Exception;