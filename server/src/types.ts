export type VoteOption = 'A' | 'B';

export interface User {
    id : string,
    name : string
}

export interface VoteMessage {
    type : 'vote';
    option : VoteOption
}

export interface JoinRoomMessage {
    type : 'join'
    roomCode :  string;
    name : string;
}

export interface CreateRoomMessage{
    type : 'create'
    name : string;
}

export type ClientMessage = VoteMessage | JoinRoomMessage | CreateRoomMessage;

export interface Room {
    code : string;
    users : Map<string , User>;
    votes : Map<string , VoteOption>;
    createdAt : number;
}