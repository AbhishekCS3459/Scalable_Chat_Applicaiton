import http from "http";
import SocketService from "./services/socket/socket";
import MessageConsumer from "./consume";
require("dotenv").config();
async function init() {

  const httpServer = http.createServer();
  const port = process.env.SERVER_PORT || 8000 ;
  const socketService = new SocketService();
  socketService.io.attach(httpServer);

  httpServer.listen(port, () => {
    console.log(`Server is listening on port https://localhost:${port}`);
  });
  
  socketService.initListners();
}
init()
  .then(async () => {
    console.log("init done");
      await MessageConsumer()
  })
  .catch((err) => {
    console.log("error in init", err);
  });


