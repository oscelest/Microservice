import Endpoint from "./Endpoint";
import ms from "ms";

class Response {
  
  public readonly code: Response.Code;
  public readonly content: any;
  public readonly time_started: Date;
  
  constructor(code: Response.Code, content: any, time_started?: Date) {
    this.code = code;
    this.content = content;
    this.time_started = time_started || new Date();
  }
  
  public Complete(response: Endpoint.Response<object>) {
    const now = new Date();
    response.status(this.code).json({
      code:          this.code,
      content:       this.content,
      time_started:  this.time_started,
      time_complete: now,
      time_elapsed:  ms(now.getTime() - this.time_started.getTime()),
    });
  }
  
}

namespace Response {
  
  export const enum Code {
    Continue = 100,
    SwitchingProtocols = 101,
    Processing = 102,
    EarlyHints = 103,
    
    OK = 200,
    Created = 201,
    Accepted = 202,
    NonAuthoritativeInformation = 203,
    NoContent = 204,
    ResetContent = 205,
    PartialContent = 206,
    MultiStatus = 207,
    AlreadyReported = 208,
    IMUsed = 226,
    
    MultipleChoices = 300,
    MovedPermanently = 301,
    Found = 302,
    SeeOther = 303,
    NotModified = 304,
    UseProxy = 305,
    TemporaryRedirect = 307,
    PermanentRedirect = 308,
    
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotAcceptable = 406,
    ProxyAuthenticationRequired = 407,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    LengthRequired = 411,
    PreconditionFailed = 412,
    RequestEntityTooLarge = 413,
    RequestURITooLong = 414,
    UnsupportedMediaType = 415,
    RequestedRangeNotSatisfiable = 416,
    ExpectationFailed = 417,
    IAmATeapot = 418,
    EnhanceYourCalm = 420,
    MisdirectedRequest = 421,
    UnprocessableEntity = 422,
    Locked = 423,
    FailedDependency = 424,
    ReservedforWebDAV = 425,
    UpgradeRequired = 426,
    PreconditionRequired = 428,
    TooManyRequests = 429,
    RequestHeaderFieldsTooLarge = 431,
    NoResponse = 444,
    RetryWith = 449,
    BlockedbyWindowsParentalControls = 450,
    UnavailableForLegalReasons = 451,
    ClientClosedRequest = 499,
    
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    HTTPVersionNotSupported = 505,
    VariantAlsoNegotiates = 506,
    InsufficientStorage = 507,
    LoopDetected = 508,
    BandwidthLimitExceeded = 509,
    NotExtended = 510,
    NetworkAuthentication = 511,
    NetworkReadTimeout = 598,
    NetworkConnecTtimeout = 599
  }
  
}

export default Response;