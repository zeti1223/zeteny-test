export type User = {
  id: string;
  username: string;
  email: string;
};

export type Room = {
  id?: string;
  name?: string;
  createdBy?: string;
  createdAt?: number;
  isDM?: boolean;
  participants?: Record<string, boolean>;
};

export type Message = {
  id?: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
};
