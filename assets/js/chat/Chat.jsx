import React, { useCallback, useEffect, useState } from "react";

import { Socket, Presence } from "phoenix";

const ConnectionStatus = ({ status, counter }) => (
  <div>
    <span>{status}</span>
    <p>{counter} users connected</p>
  </div>
);

const MessageBox = ({ messages = [] }) => {
  return (
    <div
      style={{ border: "1px solid black", height: "300px", overflow: "scroll" }}
    >
      {messages.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
};

const MessageInput = ({ onSend }) => {
  const [messageText, setMessageText] = useState("");

  return (
    <div>
      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />
      <input
        type="button"
        onClick={() => {
          onSend(messageText);
          setMessageText("");
        }}
        value="send"
      />
    </div>
  );
};

export default ({ sessionId, name }) => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [channel, setChannel] = useState(null);
  const [presence, setPresence] = useState(null);
  const [messages, setMessages] = useState([]);
  const [presenceCounter, setPresenceCounter] = useState(0);

  const sendMessage = (message) => {
    channel.push("message", { body: message });
  };

  const onMessageReceive = (payload) => {
    setMessages([...messages, payload.body]);
  };

  useEffect(() => {
    if (channel === null) {
      return;
    }

    const ref = channel.on("message", (message) => {
      onMessageReceive(message);
    });

    return () => {
      channel.off("message", ref);
    };
  }, [channel, messages]);

  useEffect(() => {
    if (presence) {
      presence.onSync(() => {
        setPresenceCounter(presence.list().length);
      });
    }
  }, [presenceCounter, presence]);

  useEffect(() => {
    const socket = new Socket("/socket", {
      params: { token: window.userToken, user_id: Math.random().toString() },
    });
    socket.connect();

    const channel = socket.channel(`session:${sessionId}`, {
      name: window.location.search.split("=")[1],
    });
    const presence = new Presence(channel);
    window.presence = presence;
    setPresence(presence);
    channel
      .join()
      .receive("ok", (_resp) => {
        setConnectionStatus("connected");
        setChannel(channel);
      })
      .receive("error", (_resp) => {
        setConnectionStatus("error");
      });
  }, []);

  return (
    <div>
      <h1>{name}</h1>
      <ConnectionStatus status={connectionStatus} counter={presenceCounter} />
      <MessageBox messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
};
