// src/components/VoteOption.tsx
'use client';

interface VoteOptionProps {
  label: string;
  emoji: string;
  onClick: () => void;
  disabled: boolean;
  color?: string;
}

export default function VoteOption({
  label,
  emoji,
  onClick,
  disabled,
  color = 'bg-blue-600',
}: VoteOptionProps) {
  return (
    <button
      className={`${color} text-white px-6 py-2 rounded disabled:opacity-50`}
      disabled={disabled}
      onClick={onClick}
    >
      {emoji} Vote {label}
    </button>
  );
}
