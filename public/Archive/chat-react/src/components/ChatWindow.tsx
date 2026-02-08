import React, { useEffect, useState, useRef } from "react";
import { db, ref, onValue, push, set } from "../firebase";
import { User, Room, Message } from "../types";

type Props = {
  currentUser: User;
  currentRoom: Room | null;
};

export default function ChatWindow({ currentUser, currentRoom }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentRoom) {
      setMessages([]);
      return;
    }
    const messagesRef = ref(db, `chat/rooms/${currentRoom.id}/messages`);
    return onValue(messagesRef, (snap) => {
      const data = snap.val() || {};
      const list: Message[] = Object.keys(data)
        .map((k) => ({ id: k, ...data[k] }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMessages(list);
      setTimeout(() => {
        if (containerRef.current)
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }, 50);
    });
  }, [currentRoom && currentRoom.id]);

  async function sendMessage() {
    if (!input.trim() || !currentRoom) return;
    const messagesRef = ref(db, `chat/rooms/${currentRoom.id}/messages`);
    const newRef = push(messagesRef);
    await set(newRef, {
      userId: currentUser.id,
      username: currentUser.username,
      text: input.trim(),
      timestamp: Date.now(),
    });
    setInput("");
  }

  return (
    <div className="main-content">
      <div className="chat-header">
        <i className="fas fa-hashtag" />
        <span id="currentChat">
          {currentRoom
            ? currentRoom.name || "Privát chat"
            : "Válassz egy szobát"}
        </span>
      </div>

      <div className="messages" id="messages" ref={containerRef}>
        {!currentRoom && (
          <div className="message">
            <div className="message-header">
              <span className="sender">Rendszer</span>
              <span className="time">--:--</span>
            </div>
            <div className="message-content">
              Üdvözöllek a chatben! Válassz egy szobát a bal oldalon.
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`message ${m.userId === currentUser.id ? "own" : ""}`}
          >
            <div className="message-header">
              <span className="sender">{m.username}</span>
              <span className="time">
                {new Date(m.timestamp).toLocaleTimeString("hu-HU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="message-content">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Írj üzenetet..."
        />
        <button onClick={sendMessage}>
          <i className="fas fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}
