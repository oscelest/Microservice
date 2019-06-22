import User from "../../microservice-shared/typescript/entities/User";
import IMSC from "../../microservice-shared/typescript/typings/IMSC";

const WebsocketMethods: IMSC.WS.MessageMethods & WebsocketData = {
  
  requests: {},
  sockets: {},
  
  basket:    {},
  frontend:  {},
  inventory: {},
  mail:      {},
  websocket: {},
  
  // async authorize(socket: SocketIO.Socket, auth: string): Promise<void> {
  //   try {
  //     const decoded = JWT.verify(auth, process.env.SECRET_JWT) as User.JWT;
  //     const user = await Environmental.db_manager.findOne(User, {where: {id: Entity.bufferFromUUID(decoded.id)}});
  //     if (!user) {
  //       socket.emit("authorize", {code: 401, content: {Authorization: auth}} as iWebsocket.Message<{Authorization: string}>);
  //     }
  //     else {
  //       Object.assign(WebsocketMethods.sockets[socket.id] || (WebsocketMethods.sockets[socket.id] = {}), {user: user});
  //       socket.emit("authorize", {code: 200, content: user.toJSON()} as iWebsocket.Message<Partial<User>>);
  //     }
  //   }
  //   catch (e) {
  //     socket.emit("authorize", {code: 401, content: {Authorization: auth}} as iWebsocket.Message<{Authorization: string}>);
  //   }
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
