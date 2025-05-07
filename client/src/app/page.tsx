'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import wsClient from '@/app/utils/ws';
import { ServerMessage } from '@/app/types';

export default function HomePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    wsClient.connect();

    const handler = (msg: ServerMessage) => {
      if (msg.type === 'joined') {
        const { roomCode, userId } = msg.payload;
        localStorage.setItem('name', name);
        localStorage.setItem('userId', userId);
        router.push(`/room/${roomCode}`);
      }
      if (msg.type === 'error') {
        setError(msg.payload.message);
      }
    };

    wsClient.onMessage(handler);

    return () => {
      wsClient.close();
    };
  }, [name, router]);

  const handleCreate = () => {
    if (!name.trim()) return setError('Name is required');
    wsClient.send({ type: 'create', name: name.trim() });
  };

  const handleJoin = () => {
    if (!name.trim()) return setError('Name is required');
    if (!roomCode.trim()) return setError('Room code is required');
    wsClient.send({ type: 'join', name: name.trim(), roomCode: roomCode.trim().toUpperCase() });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">🗳 Live Poll Battle</h1>

      <input
        className="border p-2 rounded w-64"
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 rounded w-64"
        type="text"
        placeholder="Enter room code (optional)"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />

      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer" onClick={handleCreate}>
          Create Room
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer" onClick={handleJoin}>
          Join Room
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
    </main>
  );
}
