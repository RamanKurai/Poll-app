"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import wsClient from "@/app/utils/ws";
import { ServerMessage, VoteOption } from "@/app/types";
import VoteOptionComponent from "@/app/components/VoteOptions";
import Timer from "@/app/components/Timer";
import LiveResults from "@/app/components/LiveResults";

export default function RoomPage() {
  const { code } = useParams();
  const roomCode = String(code).toUpperCase();

  const [userId, setUserId] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCounts, setVoteCounts] = useState({ A: 0, B: 0 });
  const [votingDisabled, setVotingDisabled] = useState(false);
  const [initialTimeLeft, setInitialTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    setUserId(uid || "");

    const votedKey = `voted_${roomCode}`;
    const hasVotedBefore = localStorage.getItem(votedKey);
    if (hasVotedBefore) setHasVoted(true);

    wsClient.connect();
    console.log("WebSocket connection initialized for room:", roomCode);

    const handler = (msg: ServerMessage) => {
      console.log("[WS Message Received]", msg);

      if (msg.type === "joined") {
        setUserId(msg.payload.userId);

        const timeLeft = msg.payload.timeLeft;
        console.log("[joined] Received timeLeft:", timeLeft);

        if (typeof timeLeft === "number") {
          setInitialTimeLeft(timeLeft);
          if (timeLeft <= 0) setVotingDisabled(true);
        } else {
          console.warn("[joined] Missing or invalid timeLeft in payload");
          setInitialTimeLeft(60); // Default to 60 seconds if missing
        }
      }

      if (msg.type === "update") {
        setVoteCounts(msg.payload.votes);

        const timeLeft = msg.payload.timeLeft;
        console.log("[update] Received timeLeft:", timeLeft);

        if (typeof timeLeft === "number") {
          setInitialTimeLeft(timeLeft);
          if (timeLeft <= 0) {
            setVotingDisabled(true);
          }
        } else {
          console.warn("[update] Missing or invalid timeLeft in payload");
          setVotingDisabled(true);
        }
      }

      if (msg.type === "error") {
        alert(msg.payload.message);
      }
    };

    wsClient.onMessage(handler);

    return () => {
      console.log("WebSocket connection closed for room:", roomCode);
      wsClient.close();
    };
  }, [roomCode]);

  useEffect(() => {
    console.log("Initial time left:", initialTimeLeft);
  }, [initialTimeLeft]);

  useEffect(() => {
    console.log("Initial time left (debug):", initialTimeLeft);
  }, [initialTimeLeft]);

  const handleExpire = useCallback(() => {
    setVotingDisabled(true);
  }, []);

  const castVote = (option: VoteOption) => {
    if (hasVoted || votingDisabled) return;
    wsClient.send({ type: "vote", option });
    setHasVoted(true);
    localStorage.setItem(`voted_${roomCode}`, "true");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-2xl font-semibold">Room: {roomCode}</h2>
      <p className="text-lg font-medium">
        Question: <span className="font-bold">Cats vs Dogs?</span>
      </p>

      <div className="flex gap-4">
        <VoteOptionComponent
          label="Cats"
          emoji="🐱"
          onClick={() => castVote("A")}
          disabled={hasVoted || votingDisabled}
          color="bg-purple-600"
        />
        <VoteOptionComponent
          label="Dogs"
          emoji="🐶"
          onClick={() => castVote("B")}
          disabled={hasVoted || votingDisabled}
          color="bg-yellow-500"
        />
      </div>

      {hasVoted && <p className="text-green-600">✅ You have voted</p>}
      {votingDisabled && <p className="text-red-600">⏰ Voting has ended</p>}

      <LiveResults votes={voteCounts} />

      {initialTimeLeft !== null ? (
        <Timer onExpire={handleExpire} initialTime={initialTimeLeft} />
      ) : (
        <p className="text-sm text-gray-400">Loading timer...</p>
      )}
    </main>
  );
}
