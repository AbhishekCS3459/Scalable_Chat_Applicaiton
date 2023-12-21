import { Server } from "socket.io";
import RedisConfig from "../redis/RedisClient";
import { Redis } from "ioredis";

class SocketService {
  public _io: Server;
  constructor() {
    console.log("init socket server");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
  }
  get io() {
    return this._io;
  }
  public async initListners() {
    const redisClient = RedisConfig.getInstance();
    this._io.on("connect", (socket) => {
      console.log("a user connected", socket.id);

      socket.on("event:message", ({ message }: { message: String }) => {
        console.log("message recived", message);
        // I want to publish this message to redis
        redisClient.produce("MESSAGE", JSON.stringify(message));
        this._io.emit("event:message", message);
      });
      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
    try {
      await redisClient.consume("MESSAGE", (message) => {
        console.log("emiting  recived message from redis", message);
        this._io.emit("message", message);
      });
    } catch (error) {
      console.log("error in subscriber", error);
    }

  }
}
export default SocketService;
