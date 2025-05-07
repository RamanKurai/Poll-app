export type VoteOption = 'A' | 'B';

export interface VoteMessage {
  type: 'vote';
  option: VoteOption;
}

export interface JoinRoomMessage {
  type: 'join';
  roomCode: string;
  name: string;
}

export interface CreateRoomMessage {
  type: 'create';
  name: string;
}

export type ClientMessage = VoteMessage | JoinRoomMessage | CreateRoomMessage;
export type ServerMessage =
  | {
      type: 'joined';
      payload: {
        timeLeft: number; 
        roomCode: string;
        userId: string;
      };
    }
  | {
      type: 'update';
      payload: {
        timeLeft: number;
        code: string;
        votes: { A: number; B: number };
        totalUsers: number;
      };
    }
  | {
      type: 'error';
      payload: { message: string };
    };
