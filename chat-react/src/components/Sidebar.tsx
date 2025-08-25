import React, { useEffect, useState } from "react";
import { db, ref, onValue, push, set, get, child } from "../firebase";
import { User, Room } from "../types";

type Props = {
  currentUser: User;
  onSelectRoom: (r: Room) => void;
};

export default function Sidebar({ currentUser, onSelectRoom }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"rooms" | "users">("rooms");
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const roomsRef = ref(db, "chat/rooms");
    return onValue(roomsRef, async (snap) => {
      const data = snap.val() || {};
      const list: Room[] = Object.keys(data).map((k) => ({
        id: k,
        ...data[k],
      }));
      const visible = await Promise.all(
        list.map(async (r) => {
          if (!r.id?.startsWith("dm_")) return r;
          if (r.participants && r.participants[currentUser.id]) {
            const otherId = Object.keys(r.participants).find(
              (id) => id !== currentUser.id,
            );
            if (otherId) {
              const userSnap = await get(
                child(ref(db), `chat/users/${otherId}`),
              );
              if (userSnap.exists()) {
                const uu = userSnap.val();
                r.name = uu.username;
              }
            }
            return r;
          }
          return null as any;
        }),
      );
      setRooms(visible.filter(Boolean));
    });
  }, [currentUser.id]);

  useEffect(() => {
    const usersRef = ref(db, "chat/users");
    return onValue(usersRef, (snap) => {
      const data = snap.val() || {};
      const list: User[] = Object.keys(data).map((k) => ({
        id: k,
        username: data[k].username,
        email: data[k].email,
      }));
      setUsers(list.filter((u) => u.id !== currentUser.id));
    });
  }, [currentUser.id]);

  async function createRoom() {
    if (!roomName.trim()) return;
    const roomsRef = ref(db, "chat/rooms");
    const newRef = push(roomsRef);
    await set(newRef, {
      name: roomName,
      createdBy: currentUser.id,
      createdAt: Date.now(),
    });
    setRoomName("");
    setShowCreate(false);
  }

  async function startDM(userId: string, username: string) {
    const dmIdArr = [currentUser.id, userId].sort();
    const roomId = `dm_${dmIdArr.join("_")}`;
    const roomRef = ref(db, `chat/rooms/${roomId}`);
    const snap = await get(roomRef);
    if (!snap.exists()) {
      await set(roomRef, {
        name: `Privát chat: ${currentUser.username} és ${username}`,
        createdBy: currentUser.id,
        createdAt: Date.now(),
        isDM: true,
        participants: {
          [currentUser.id]: true,
          [userId]: true,
        },
      });
    }
    onSelectRoom({ id: roomId, name: username, isDM: true });
  }

  return (
    <div className="sidebar">
      <div className="user-info">
        <div className="avatar">
          {currentUser.username.charAt(0).toUpperCase()}
        </div>
        <div className="user-details">
          <div className="username">{currentUser.username}</div>
          <div className="email">{currentUser.email}</div>
        </div>
      </div>

      <div className="tabs">
        <div
          className={`tab ${activeTab === "rooms" ? "active" : ""}`}
          onClick={() => setActiveTab("rooms")}
        >
          Szobák
        </div>
        <div
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Felhasználók
        </div>
      </div>

      {activeTab === "rooms" && (
        <div className="tab-content active" id="roomsTab">
          <h3>Chat Szobák</h3>
          <ul className="room-list">
            {rooms.length === 0 && (
              <p style={{ padding: "1rem", textAlign: "center", opacity: 0.7 }}>
                Még nincsenek szobák. Hozz létre egyet!
              </p>
            )}
            {rooms.map((r) => (
              <li
                key={r.id}
                className={`room-item ${r.id?.startsWith("dm_") ? "dm-indicator" : ""}`}
                onClick={() => onSelectRoom(r)}
              >
                <i
                  className={
                    r.id?.startsWith("dm_") ? "fas fa-lock" : "fas fa-hashtag"
                  }
                />{" "}
                {r.name}
              </li>
            ))}
          </ul>
          <button
            className="create-room-btn"
            onClick={() => setShowCreate(true)}
          >
            <i className="fas fa-plus" /> Új szoba
          </button>
          {showCreate && (
            <div className="modal-overlay active">
              <div className="modal">
                <div className="modal-header">
                  <h2 className="modal-title">Új chat szoba</h2>
                  <button
                    className="modal-close"
                    onClick={() => setShowCreate(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Szoba neve</label>
                    <input
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="modal-btn secondary"
                    onClick={() => setShowCreate(false)}
                  >
                    Mégse
                  </button>
                  <button className="modal-btn primary" onClick={createRoom}>
                    Létrehozás
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="tab-content active" id="usersTab">
          <h3>Online Felhasználók</h3>
          <ul className="user-list">
            {users.map((u) => (
              <li
                key={u.id}
                className="user-item"
                onClick={() => startDM(u.id, u.username)}
              >
                <i className="fas fa-user" /> {u.username}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
