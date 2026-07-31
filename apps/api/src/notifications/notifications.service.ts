import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Notification, Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import type { NotificationResponse, NotificationType } from "./notification.types.js";

type PrismaLikeClient = PrismaClient | Prisma.TransactionClient;

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
};

@Injectable()
export class NotificationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(
    input: CreateNotificationInput,
    client?: PrismaLikeClient,
  ): Promise<Notification> {
    const db = client ?? this.prisma;
    return db.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type ?? "INFO",
        link: input.link ?? null,
      },
    });
  }

  async listForUser(userId: string, take = 50): Promise<NotificationResponse[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
    return notifications.map((n) => this.toResponse(n));
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markRead(userId: string, id: string): Promise<NotificationResponse> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return this.toResponse(updated);
  }

  async markAllRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { count: result.count };
  }

  async delete(userId: string, id: string): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    await this.prisma.notification.delete({ where: { id } });
  }

  async resolveStudentUserId(studentId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { studentId },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  private toResponse(n: Notification): NotificationResponse {
    return {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      ...(n.link != null ? { link: n.link } : {}),
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    };
  }
}
