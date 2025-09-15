import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Auth from "./components/Auth";
import { User, Room } from "./types";
import "./styles.css";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    () => localStorage.getItem("darkMode") === "true",
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (currentUser)
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  if (!currentUser) {
    return <Auth onLogin={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="app-root">
      <Header
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentRoom(null);
          localStorage.removeItem("currentUser");
        }}
        isDarkMode={isDarkMode}
        toggleDark={() => setIsDarkMode((s) => !s)}
      />
      <div className="container" id="mainContainer" style={{ display: "flex" }}>
        <Sidebar
          currentUser={currentUser}
          onSelectRoom={(r) => setCurrentRoom(r)}
        />
        <ChatWindow currentUser={currentUser} currentRoom={currentRoom} />
      </div>
    </div>
  );
}

export default App;
