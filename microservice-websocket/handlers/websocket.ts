import JWT from "jsonwebtoken";
import User from "../../microservice-shared/typescript/entities/User";
import Entity from "../../microservice-shared/typescript/services/Entity";
import Environmental from "../../microservice-shared/typescript/services/Environmental";
import Response from "../../microservice-shared/typescript/services/Response";
import IMSC from "../../microservice-shared/typescript/typings/IMSC";

const WebsocketMethods: IMSC.WS.MessageMethods & WebsocketData = {
  
  requests: {},
  sockets:  {},
  
  basket:    {},
  frontend:  {},
  inventory: {},
  mail:      {},
  websocket: {
    async authorize(socket_id: string, jwt: string): Promise<any> {
      try {
        const decoded = JWT.verify(jwt, process.env.SECRET_JWT) as User.JWT;
        const user = await Environmental.db_manager.findOne(User, {where: {id: Entity.bufferFromUUID(decoded.id)}});
        WebsocketMethods.sockets[socket_id] = {user: user};
      }
      catch (e) {
        if (e.code) throw new Response(Response.Code.Unauthorized, {content: {Authorization: jwt}});
        throw new Response(Response.Code.InternalServerError, {method: "authorize", target: "websocket", parameters: [socket_id, jwt]});
      }
    },
  },
  
  // async authorize(socket: SocketIO.Socket, auth: string): Promise<void> {
  
  // },
  
  // async basketFind(socket: SocketIO.Socket, id: string): Promise<void> {
  //
  // },
};

interface WebsocketData {
  sockets: {
    [key: string]: {
      user: User
    }
  }
  
  requests: {
    [key: string]: {
      socket: string,
      message: IMSC.Message<any>,
      timeout: NodeJS.Timeout
    }
  }
}

export default WebsocketMethods;
