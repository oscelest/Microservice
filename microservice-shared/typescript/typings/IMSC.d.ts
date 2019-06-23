namespace IMSC {
  
  export namespace AMQP {
    export interface WebsocketMessage {
    }
    
    export interface FrontendMessage {
    
    }
    
    export interface BasketMessage {
    }
    
    export interface InventoryMessage {
    }
    
    export interface MailMessage {
    }
    
    export interface MessageMethods {
      mail: MailMessage
      basket: BasketMessage
      inventory: InventoryMessage
      websocket: WebsocketMessage
      frontend: FrontendMessage
    }
  }
  
  export namespace WS {
    export interface WebsocketMessage {
      authorize(socket_id: string, jwt: string): Promise<any>
    }
    
    export interface FrontendMessage {
    
    }
    
    export interface BasketMessage {
    }
    
    export interface InventoryMessage {
      // find(a: number): Promise<void>
    }
    
    export interface MailMessage {
      // send(a: string): Promise<void>
    }
    
    export interface MessageMethods {
      mail: MailMessage
      basket: BasketMessage
      inventory: InventoryMessage
      websocket: WebsocketMessage
      frontend: FrontendMessage
    }
  }
  
  export type Message<Service extends WS.MessageMethods[keyof WS.MessageMethods]> = {
    id: string
    source: keyof WS.MessageMethods & string
    target: keyof WS.MessageMethods & string
    method: keyof Service
    parameters: Parameters<Service[keyof Service]>
  }
  
  export type Message<Service extends AMQP.MessageMethods[keyof AMQP.MessageMethods]> = {
    id: string
    source: keyof AMQP.MessageMethods & string
    target: keyof AMQP.MessageMethods & string
    method: keyof Service
    parameters: Parameters<Service[keyof Service]>
  }
  
}

export default IMSC;
