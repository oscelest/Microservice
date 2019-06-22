import Promise from "bluebird";

class Environmental {

}

namespace Environmental {
  export const tokens = {
    jwt: process.env.SECRET_JWT || "",
  };
  
  export const db_connection: import("typeorm").Connection = null;
  export const db_manager: import("typeorm").EntityManager = null;
  export const mq_channel: import("amqplib").Channel = null;
  export const ws_server: import("socket.io").Server = null;
  
  export function Connect<T>(promise_cb: () => Promise<T>, retries: number = 60): Promise<T> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() =>
        promise_cb()
        .then(res => {
          clearInterval(interval);
          resolve(res);
        })
        .catch(err => {
          console.log("Retries remaining:", retries);
          if (retries-- === 0) {
            clearInterval(interval);
            reject(err);
          }
        }), 1000,
      );
    });
  }
}

export default Environmental;
