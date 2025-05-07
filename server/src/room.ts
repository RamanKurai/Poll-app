import { Room, VoteOption, User } from './types';
import { randomUUID } from 'crypto';

const rooms: Map<string, Room> = new Map();

export function createRoom(userName: string): { room: Room; user: User } {
  const code = generateRoomCode();
  const user = { id: randomUUID(), name: userName };
  const room: Room = {
    code,
    users: new Map([[user.id, user]]),
    votes: new Map(),
    createdAt: Date.now()
  };
  rooms.set(code, room);
  return { room, user };
}

export function joinRoom(roomCode: string, userName: string): { room?: Room; user?: User } {
  const room = rooms.get(roomCode);
  if (!room) return {};
  const user = { id: randomUUID(), name: userName };
  room.users.set(user.id, user);
  return { room, user };
}

export function castVote(roomCode: string, userId: string, option: VoteOption) {
  const room = rooms.get(roomCode);
  if (!room || !room.users.has(userId)) return;
  if (!room.votes.has(userId)) {
    room.votes.set(userId, option);
  }
}

export function getRoomState(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return null;

  const counts = { A: 0, B: 0 };
  for (const vote of room.votes.values()) {
    counts[vote]++;
  }

  // ✅ Add this line if missing
  const timeLeft = Math.max(0, 60 - Math.floor((Date.now() - room.createdAt) / 1000));

  return {
    code: room.code,
    votes: counts,
    totalUsers: room.users.size,
    timeLeft, // ✅ make sure this is here
  };
}





function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}
