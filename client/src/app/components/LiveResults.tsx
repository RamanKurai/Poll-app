// src/components/LiveResults.tsx
'use client';

interface LiveResultsProps {
  votes: { A: number; B: number };
}

export default function LiveResults({ votes }: LiveResultsProps) {
  return (
    <div className="text-lg mt-4">
      <p>Live Results:</p>
      <p>Cats 🐱: {votes.A}</p>
      <p>Dogs 🐶: {votes.B}</p>
    </div>
  );
}
