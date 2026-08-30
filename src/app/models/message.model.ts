export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
  readBy?: {
    [uid: string]: boolean;
  };
}