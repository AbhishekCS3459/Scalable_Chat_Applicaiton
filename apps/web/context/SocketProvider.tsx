"use client";
import React, { useCallback, useEffect } from "react";
interface SocketProviderProps {
  children?: React.ReactNode;
}
import { io, Socket } from "socket.io-client";
interface ISocketContext {
  sendMessage: (msg: string) => void;
  messages: string[];
}
const SocketContext = React.createContext<ISocketContext | null>(null);
// creting a custom hook
export const useSocket = () => {
  const state = React.useContext(SocketContext);
  if (!state) {
    throw new Error("SocketProvider not found");
  }
  return state;
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = React.useState<Socket | null>();
  const [messages, setMessages] = React.useState<string[]>([]);
  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg: string) => {
      console.log("send message", msg);
      if (socket) {
        socket.emit("event:message", {
          message: msg,
        });
      }
    },
    [socket]
  );
  const onMessageRecived = useCallback((msg: string) => {
    console.log("message recived from server in callback", msg);
    const message = JSON.parse(msg) as { message: string };
    setMessages((prev) => [...prev, message]);
  }, []);
  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("message", onMessageRecived);
    setSocket(_socket);
    return () => {
      _socket.off("message", onMessageRecived);
      _socket.disconnect();
      setSocket(null);
    };
  }, []);
  return (
    <SocketContext.Provider value={{ sendMessage,messages }}>
      {children}
    </SocketContext.Provider>
  );
};
