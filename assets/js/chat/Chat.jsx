import React, { useEffect, useState } from "react";
import { Socket, Presence } from "phoenix";

const ConnectionStatus = ({ status, counter }) => (
  <div>
    <p className={`text-sm ${status === "connected" ? "text-green-700" : ""}`}>
      {status}
    </p>
    <p className="text-sm">
      <span className="text-bold text-gray-600">{counter}</span> users connected
    </p>
  </div>
);

const MessageBox = ({ messages = [] }) => {
  return (
    <div
      className="flex flex-col border border-gray-200 rounded p-2 mt-2 mb-2"
      style={{ height: "500px" }}
    >
      {messages.map((m, i) => (
        <p key={i}>
          <span className="text-bold text-gray-600 pr-2">{m.name}:</span>
          {m.body}
        </p>
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
        className="border border-gray-400 rounded px-2 py-1 mr-2"
        onChange={(e) => setMessageText(e.target.value)}
      />
      <input
        type="button"
        onClick={() => {
          onSend(messageText);
          setMessageText("");
        }}
        value="send"
        className="text-center rounded-md px-2 py-1 transition-colors ease-in-out shadow-lg w-max self-center text-white bg-pink-600 hover:bg-pink-500 border-2 border-pink-600"
      />
    </div>
  );
};

const DisplayNamePrompt = ({ onPress }) => {
  const [displayName, setDisplayName] = useState("");

  return (
    <div className="flex flex-col space-y-2">
      <p>Please select your screen name to join the room</p>
      <div>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="border border-gray-400 rounded px-2 py-1 mr-2"
        />
        <input
          type="button"
          className="text-center rounded-md px-2 py-1 transition-colors ease-in-out shadow-lg w-max self-center text-white bg-pink-600 hover:bg-pink-500 border-2 border-pink-600"
          value="Join"
          onClick={() => onPress(displayName)}
        />
      </div>
    </div>
  );
};

export default ({ sessionId, name }) => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [channel, setChannel] = useState(null);
  const [presence, setPresence] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [presenceCounter, setPresenceCounter] = useState(0);
  const [displayName, setDisplayName] = useState(null);

  const sendMessage = (message) => {
    channel.push("message", { body: message });
  };

  const onMessageReceive = (payload) => {
    setMessages([...messages, payload]);
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
    const sock = new Socket("/socket", {
      params: { token: window.userToken },
    });

    sock.connect();

    setSocket(sock);

    return () => sock.disconnect();
  }, []);

  useEffect(() => {
    if (displayName) {
      const channel = socket.channel(`session:${sessionId}`, {
        name: displayName,
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
    }
  }, [displayName]);

  return (
    <div>
      <h1 className="text-2xl font-bold">{name}</h1>
      {!displayName && <DisplayNamePrompt onPress={setDisplayName} />}

      {displayName && (
        <>
          <ConnectionStatus
            status={connectionStatus}
            counter={presenceCounter}
          />
          <MessageBox messages={messages} />
          <MessageInput onSend={sendMessage} />
        </>
      )}
    </div>
  );
};
