export interface INotification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}
