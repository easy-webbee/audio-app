export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
  dc_msg_full?:any;
  readBy?: {
    [uid: string]: boolean;
  };
}