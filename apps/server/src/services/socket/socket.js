"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
class SocketService {
    constructor() {
        console.log("init socket server");
        this._io = new socket_io_1.Server();
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new SocketService();
        }
        return this._instance;
    }
}
exports.default = SocketService;
