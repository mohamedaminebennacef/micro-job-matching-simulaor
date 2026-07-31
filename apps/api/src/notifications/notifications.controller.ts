import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { NotificationsService } from "./notifications.service.js";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List own notifications, newest first" })
  @ApiResponse({ status: 200, description: "List of notifications." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  list(@CurrentUser() user: { id: string }) {
    return this.notificationsService.listForUser(user.id);
  }

  @Get("unread")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get unread notification count" })
  @ApiResponse({ status: 200, description: "Unread count." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async unreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.notificationsService.unreadCount(user.id);
    return { count };
  }

  @Patch(":id/read")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiParam({ name: "id", description: "Notification UUID" })
  @ApiResponse({ status: 200, description: "Notification marked as read." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Notification not found." })
  markRead(
    @CurrentUser() user: { id: string },
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return this.notificationsService.markRead(user.id, id);
  }

  @Patch("read-all")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark all own notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  markAllRead(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a notification" })
  @ApiParam({ name: "id", description: "Notification UUID" })
  @ApiResponse({ status: 200, description: "Notification deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Notification not found." })
  remove(
    @CurrentUser() user: { id: string },
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return this.notificationsService.delete(user.id, id);
  }
}
