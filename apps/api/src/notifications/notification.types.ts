export type NotificationType = "INFO" | "SUCCESS" | "WARNING";

export type NotificationResponse = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  createdAt: string;
};
