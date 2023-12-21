"use client";
import React from "react";
import classes from "./page.module.css";
import { useSocket } from "../context/SocketProvider";

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = React.useState("");

  return (
    <div>
      <div>
        <h1>All Message will appear here</h1>
      </div>
      <div
        style={{
          height: "300px",
          width: "300px",
          border: "1px solid black",
          overflow: "auto",
        }}
      >
        {messages.length > 0 &&
          messages.map((msg, index) => 
          <div key={index}>{msg}</div>)
        }
      </div>
      <div>
        <input
          onChange={(e) => setMessage(e.target.value)}
          className={classes["chat-input"]}
          placeholder="Message..."
        />
        <button
          onClick={(e) => {
            sendMessage(message);
          }}
          className={classes["button"]}
        >
          Send
        </button>
      </div>
    </div>
  );
}
