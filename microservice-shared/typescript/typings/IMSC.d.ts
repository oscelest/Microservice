import Product from "../entities/Product";

namespace IMSC {
  
  export namespace AMQP {
    export interface WebsocketMessage {
      product_update(product_id: string)
    }
    
    export interface MailMessage {
      send(type: string, recipient_user_id: string)
    }
    
    export interface CheckoutMessage {}
    
    export interface ProductMessage {}
    
    export interface MessageMethods {
      mail: MailMessage
      product: ProductMessage
      checkout: CheckoutMessage
      websocket: WebsocketMessage
    }
  }
  
  export namespace WS {
    export interface WebsocketMessage {
      authorize(socket_id: string, jwt: string): Promise<any>
    }
    
    export interface FrontendMessage {
      product_update(product: Product): void
    }
    
    export interface MessageMethods {
      websocket: WebsocketMessage
      frontend: FrontendMessage
    }
  }
  
  export type WSMessage<Service extends WS.MessageMethods[keyof WS.MessageMethods]> = {
    id: string
    method: keyof Service
    parameters: Parameters<Service[keyof Service]>
  }
  
  export type AMQPMessage<Service extends AMQP.MessageMethods[keyof AMQP.MessageMethods]> = {
    id: string
    source: keyof AMQP.MessageMethods & string
    target: keyof AMQP.MessageMethods & string
    method: keyof Service
    parameters: Parameters<Service[keyof Service]>
  }
  
}

export default IMSC;
