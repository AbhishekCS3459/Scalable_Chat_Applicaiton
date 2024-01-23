import { Server } from "socket.io";
import RedisConfig from "../redis/RedisClient";
import prismaClient from "../PrismaService/prisma";
import KafkaConfig from "../kafka/KafkaClient";

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
    const kafkaClient = KafkaConfig.getInstance();
    this._io.on("connect", (socket) => {
      console.log("a user connected", socket.id);

      socket.on("event:message", ({ message }: { message: String }) => {
        console.log("message recived", message);
        // I want to publish this message to redis
        redisClient.produce("MESSAGE", JSON.stringify(message));
        this._io.emit("event:message", message);

        kafkaClient
          .produce("MESSAGES", JSON.stringify(message))
          .then((res) => {
            if (res) console.log("message produced to kafka producer", res);
          })
          .catch((err) => {
            console.log("error in saving message", err);
          });
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
