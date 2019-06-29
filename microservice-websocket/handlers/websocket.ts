import JWT from "jsonwebtoken";
import User from "../../microservice-shared/typescript/entities/User";
import Environmental from "../../microservice-shared/typescript/services/Environmental";
import Response from "../../microservice-shared/typescript/services/Response";
import IMSC from "../../microservice-shared/typescript/typings/IMSC";

const sockets = {};

const WebsocketMethods: IMSC.WS.WebsocketMessage = {
  async authorize(socket_id: string, jwt: string): Promise<any> {
    try {
      const decoded = JWT.verify(jwt, process.env.SECRET_JWT) as User.JWT;
      const user = await Environmental.db_manager.findOne(User, {where: {id: decoded.id}});
      sockets[socket_id] = {user: user};
    }
    catch (e) {
      if (e.code) return new Response(Response.Code.Unauthorized, {content: {Authorization: jwt}});
      return new Response(Response.Code.InternalServerError, {method: "authorize", target: "websocket", parameters: [socket_id, jwt]});
    }
  },
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
      message: IMSC.WSMessage<any>,
      timeout: NodeJS.Timeout
    }
  }
}

export default WebsocketMethods;
