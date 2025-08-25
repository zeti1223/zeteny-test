import React from "react";
import { User } from "../types";

type Props = {
  currentUser: User;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDark: () => void;
};

export default function Header({
  currentUser,
  onLogout,
  isDarkMode,
  toggleDark,
}: Props) {
  return (
    <header>
      <div className="logo">
        <i className="fas fa-comments" /> Firebase Chat
      </div>
      <div className="header-controls">
        <button className="theme-toggle" onClick={toggleDark}>
          <i className={isDarkMode ? "fas fa-sun" : "fas fa-moon"} />
        </button>
        <button className="logout-btn" onClick={onLogout}>
          <i className="fas fa-sign-out-alt" />
        </button>
      </div>
    </header>
  );
}
