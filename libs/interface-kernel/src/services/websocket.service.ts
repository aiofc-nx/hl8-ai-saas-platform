/**
 * @fileoverview WebSocket 服务
 * @description 提供 WebSocket 连接和消息处理功能
 */

import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { Server, Socket } from "socket.io";
import { AuthenticationService } from "./authentication.service.js";
import { AuthorizationService } from "./authorization.service.js";
import { RateLimitService } from "./rate-limit.service.js";
import { MonitoringService } from "./monitoring.service.js";
import type {
  InterfaceFastifyRequest,
  WebSocketEvent,
  WebSocketConnection,
  UserContext,
} from "../types/index.js";

/**
 * WebSocket 事件数据接口
 * @description 定义 WebSocket 事件数据的结构
 */
interface WebSocketEventData {
  room?: string;
  message?: string;
  type?: string;
  title?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * WebSocket 服务
 * @description 提供 WebSocket 连接和消息处理功能
 */
@Injectable()
export class WebSocketService {
  private io: Server;
  private connections: Map<string, WebSocketConnection> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  constructor(
    private readonly logger: FastifyLoggerService,
    private readonly authenticationService: AuthenticationService,
    private readonly authorizationService: AuthorizationService,
    private readonly rateLimitService: RateLimitService,
    private readonly monitoringService: MonitoringService,
  ) {
    this.logger.log("WebSocket Service initialized");
  }

  /**
   * 初始化 WebSocket 服务器
   * @description 初始化 Socket.IO 服务器
   * @param server HTTP 服务器实例
   */
  initializeWebSocketServer(server: unknown): void {
    try {
      this.io = new Server(server, {
        cors: {
          origin: process.env.CORS_ORIGIN || "*",
          credentials: true,
        },
        // namespace: process.env.WEBSOCKET_NAMESPACE || "/api/v1/websocket", // 暂时注释掉，因为不是有效的配置选项
      });

      this.setupEventHandlers();
      this.logger.debug("WebSocket server initialized");
    } catch (error) {
      this.logger.error(
        `Failed to initialize WebSocket server: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 设置事件处理器
   * @description 设置 WebSocket 事件处理器
   */
  private setupEventHandlers(): void {
    this.io.on("connection", this.handleConnection.bind(this));
  }

  /**
   * 处理连接
   * @description 处理新的 WebSocket 连接
   * @param socket Socket 连接
   */
  private async handleConnection(socket: Socket): Promise<void> {
    try {
      this.logger.debug(`New WebSocket connection: ${socket.id}`);

      // 1. 认证检查
      const user = await this.authenticateConnection(socket);
      if (!user) {
        socket.emit("error", { message: "Authentication required" });
        socket.disconnect();
        return;
      }

      // 2. 创建连接记录
      const connection: WebSocketConnection = {
        socket,
        userId: user.id,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        rooms: [],
        connectedAt: new Date(),
        lastActivity: new Date(),
      };

      this.connections.set(socket.id, connection);

      // 3. 设置连接事件处理器
      this.setupConnectionEventHandlers(socket, connection);

      // 4. 加入默认房间
      await this.joinDefaultRooms(connection);

      // 5. 发送连接确认
      socket.emit("connected", {
        message: "Connected successfully",
        userId: user.id,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(
        `WebSocket connection established for user: ${user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Connection handling failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.emit("error", { message: "Connection failed" });
      socket.disconnect();
    }
  }

  /**
   * 认证连接
   * @description 认证 WebSocket 连接
   * @param socket Socket 连接
   * @returns 用户上下文或 null
   */
  private async authenticateConnection(
    socket: Socket,
  ): Promise<UserContext | null> {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        this.logger.debug("No token provided for WebSocket connection");
        return null;
      }

      const user = await this.authenticationService.verifyToken(token);
      return user;
    } catch (error) {
      this.logger.debug(
        `WebSocket authentication failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * 设置连接事件处理器
   * @description 为连接设置事件处理器
   * @param socket Socket 连接
   * @param connection 连接记录
   */
  private setupConnectionEventHandlers(
    socket: Socket,
    connection: WebSocketConnection,
  ): void {
    // 消息处理
    socket.on("message", this.handleMessage.bind(this, socket, connection));

    // 房间管理
    socket.on("join-room", this.handleJoinRoom.bind(this, socket, connection));
    socket.on(
      "leave-room",
      this.handleLeaveRoom.bind(this, socket, connection),
    );

    // 心跳处理
    socket.on("ping", this.handlePing.bind(this, socket, connection));

    // 断开连接处理
    socket.on(
      "disconnect",
      this.handleDisconnect.bind(this, socket, connection),
    );

    // 错误处理
    socket.on("error", this.handleError.bind(this, socket, connection));
  }

  /**
   * 处理消息
   * @description 处理 WebSocket 消息
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param data 消息数据
   */
  private async handleMessage(
    socket: Socket,
    connection: WebSocketConnection,
    data: WebSocketEventData,
  ): Promise<void> {
    try {
      this.logger.debug(`Handling WebSocket message: ${data.event}`);

      // 1. 速率限制检查
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        {
          headers: { "x-user-id": connection.userId },
        } as unknown as InterfaceFastifyRequest,
        "websocket",
      );

      if (!rateLimitResult.allowed) {
        socket.emit("error", { message: "Rate limit exceeded" });
        return;
      }

      // 2. 验证消息格式
      const event: WebSocketEvent = {
        event: data.event as string,
        data: data.data,
        timestamp: new Date().toISOString(),
        userId: connection.userId,
        tenantId: connection.tenantId,
      };

      // 3. 处理消息
      await this.processMessage(socket, connection, event);

      // 4. 更新活动时间
      connection.lastActivity = new Date();
    } catch (error) {
      this.logger.error(
        `Message handling failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.emit("error", { message: "Message processing failed" });
    }
  }

  /**
   * 处理加入房间
   * @description 处理加入房间请求
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param data 房间数据
   */
  private async handleJoinRoom(
    socket: Socket,
    connection: WebSocketConnection,
    data: WebSocketEventData,
  ): Promise<void> {
    try {
      const roomName = data.room;
      this.logger.debug(`User ${connection.userId} joining room: ${roomName}`);

      // 检查权限
      const hasPermission = await this.authorizationService.checkPermission(
        { id: connection.userId, tenantId: connection.tenantId } as UserContext,
        "rooms",
        "join",
      );

      if (!hasPermission) {
        socket.emit("error", {
          message: "Insufficient permissions to join room",
        });
        return;
      }

      // 加入房间
      await socket.join(roomName);
      connection.rooms.push(roomName);

      // 更新房间成员列表
      if (!this.rooms.has(roomName)) {
        this.rooms.set(roomName, new Set());
      }
      this.rooms.get(roomName)!.add(socket.id);

      // 发送确认
      socket.emit("room-joined", { room: roomName });

      this.logger.debug(`User ${connection.userId} joined room: ${roomName}`);
    } catch (error) {
      this.logger.error(
        `Join room failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.emit("error", { message: "Failed to join room" });
    }
  }

  /**
   * 处理离开房间
   * @description 处理离开房间请求
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param data 房间数据
   */
  private async handleLeaveRoom(
    socket: Socket,
    connection: WebSocketConnection,
    data: WebSocketEventData,
  ): Promise<void> {
    try {
      const roomName = data.room;
      this.logger.debug(`User ${connection.userId} leaving room: ${roomName}`);

      // 离开房间
      await socket.leave(roomName);
      connection.rooms = connection.rooms.filter((room) => room !== roomName);

      // 更新房间成员列表
      if (this.rooms.has(roomName)) {
        this.rooms.get(roomName)!.delete(socket.id);
        if (this.rooms.get(roomName)!.size === 0) {
          this.rooms.delete(roomName);
        }
      }

      // 发送确认
      socket.emit("room-left", { room: roomName });

      this.logger.debug(`User ${connection.userId} left room: ${roomName}`);
    } catch (error) {
      this.logger.error(
        `Leave room failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.emit("error", { message: "Failed to leave room" });
    }
  }

  /**
   * 处理心跳
   * @description 处理心跳消息
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param data 心跳数据
   */
  private async handlePing(
    socket: Socket,
    connection: WebSocketConnection,
    _data: WebSocketEventData,
  ): Promise<void> {
    try {
      // 更新活动时间
      connection.lastActivity = new Date();

      // 发送心跳响应
      socket.emit("pong", {
        timestamp: new Date().toISOString(),
        serverTime: Date.now(),
      });
    } catch (error) {
      this.logger.error(
        `Ping handling failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 处理断开连接
   * @description 处理连接断开
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param reason 断开原因
   */
  private async handleDisconnect(
    socket: Socket,
    connection: WebSocketConnection,
    reason: string,
  ): Promise<void> {
    try {
      this.logger.debug(
        `WebSocket disconnected: ${socket.id}, reason: ${reason}`,
      );

      // 从所有房间中移除
      for (const room of connection.rooms) {
        if (this.rooms.has(room)) {
          this.rooms.get(room)!.delete(socket.id);
          if (this.rooms.get(room)!.size === 0) {
            this.rooms.delete(room);
          }
        }
      }

      // 移除连接记录
      this.connections.delete(socket.id);

      this.logger.debug(`WebSocket connection cleaned up: ${socket.id}`);
    } catch (error) {
      this.logger.error(
        `Disconnect handling failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 处理错误
   * @description 处理 WebSocket 错误
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param error 错误对象
   */
  private async handleError(
    socket: Socket,
    connection: WebSocketConnection,
    error: Error,
  ): Promise<void> {
    try {
      this.logger.error(
        `WebSocket error: ${error instanceof Error ? error.message : String(error)}`,
      );

      // 记录错误指标
      this.monitoringService.recordErrorMetrics(error, {
        socketId: socket.id,
        userId: connection.userId,
      });
    } catch (err) {
      this.logger.error(
        `Error handling failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /**
   * 处理消息
   * @description 处理具体的消息逻辑
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param event 消息事件
   */
  private async processMessage(
    socket: Socket,
    connection: WebSocketConnection,
    event: WebSocketEvent,
  ): Promise<void> {
    try {
      switch (event.event) {
        case "chat":
          await this.handleChatMessage(socket, connection, event);
          break;
        case "notification":
          await this.handleNotificationMessage(socket, connection, event);
          break;
        case "status":
          await this.handleStatusMessage(socket, connection, event);
          break;
        default:
          this.logger.debug(`Unknown message event: ${event.event}`);
          socket.emit("error", { message: `Unknown event: ${event.event}` });
      }
    } catch (error) {
      this.logger.error(
        `Message processing failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.emit("error", { message: "Message processing failed" });
    }
  }

  /**
   * 处理聊天消息
   * @description 处理聊天消息
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param event 消息事件
   */
  private async handleChatMessage(
    socket: Socket,
    connection: WebSocketConnection,
    event: WebSocketEvent,
  ): Promise<void> {
    try {
      const { room, message } = event.data as WebSocketEventData;

      // 检查用户是否在房间中
      if (!connection.rooms.includes(room)) {
        socket.emit("error", { message: "Not in room" });
        return;
      }

      // 广播消息到房间
      socket.to(room).emit("chat-message", {
        from: connection.userId,
        room,
        message,
        timestamp: event.timestamp,
      });

      // 发送确认
      socket.emit("message-sent", { room, message });
    } catch (error) {
      this.logger.error(
        `Chat message handling failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.emit("error", { message: "Chat message failed" });
    }
  }

  /**
   * 处理通知消息
   * @description 处理通知消息
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param event 消息事件
   */
  private async handleNotificationMessage(
    socket: Socket,
    connection: WebSocketConnection,
    event: WebSocketEvent,
  ): Promise<void> {
    try {
      const { type, title, message } = event.data as WebSocketEventData;

      // 发送通知
      socket.emit("notification", {
        type,
        title,
        message,
        timestamp: event.timestamp,
      });
    } catch (error) {
      this.logger.error(
        `Notification message handling failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.emit("error", { message: "Notification failed" });
    }
  }

  /**
   * 处理状态消息
   * @description 处理状态消息
   * @param socket Socket 连接
   * @param connection 连接记录
   * @param event 消息事件
   */
  private async handleStatusMessage(
    socket: Socket,
    connection: WebSocketConnection,
    event: WebSocketEvent,
  ): Promise<void> {
    try {
      const { status } = event.data as WebSocketEventData;

      // 更新用户状态
      socket.emit("status-updated", {
        userId: connection.userId,
        status,
        timestamp: event.timestamp,
      });
    } catch (error) {
      this.logger.error(
        `Status message handling failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.emit("error", { message: "Status update failed" });
    }
  }

  /**
   * 加入默认房间
   * @description 将用户加入默认房间
   * @param connection 连接记录
   */
  private async joinDefaultRooms(
    connection: WebSocketConnection,
  ): Promise<void> {
    try {
      // 加入用户专用房间
      const userRoom = `user:${connection.userId}`;
      await connection.socket.join(userRoom);
      connection.rooms.push(userRoom);

      // 加入租户房间
      const tenantRoom = `tenant:${connection.tenantId}`;
      await connection.socket.join(tenantRoom);
      connection.rooms.push(tenantRoom);

      // 如果用户属于组织，加入组织房间
      if (connection.organizationId) {
        const orgRoom = `organization:${connection.organizationId}`;
        await connection.socket.join(orgRoom);
        connection.rooms.push(orgRoom);
      }

      // 如果用户属于部门，加入部门房间
      if (connection.departmentId) {
        const deptRoom = `department:${connection.departmentId}`;
        await connection.socket.join(deptRoom);
        connection.rooms.push(deptRoom);
      }

      this.logger.debug(`User ${connection.userId} joined default rooms`);
    } catch (error) {
      this.logger.error(
        `Failed to join default rooms: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 广播消息到房间
   * @description 向房间中的所有用户广播消息
   * @param room 房间名称
   * @param event 事件名称
   * @param data 消息数据
   */
  broadcastToRoom(room: string, event: string, data: unknown): void {
    try {
      this.io.to(room).emit(event, data);
      this.logger.debug(`Broadcasted message to room: ${room}`);
    } catch (error) {
      this.logger.error(
        `Failed to broadcast to room: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 发送消息给用户
   * @description 向特定用户发送消息
   * @param userId 用户ID
   * @param event 事件名称
   * @param data 消息数据
   */
  sendToUser(userId: string, event: string, data: unknown): void {
    try {
      const userRoom = `user:${userId}`;
      this.io.to(userRoom).emit(event, data);
      this.logger.debug(`Sent message to user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message to user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取连接统计
   * @description 获取 WebSocket 连接统计信息
   * @returns 连接统计
   */
  getConnectionStats(): {
    totalConnections: number;
    totalRooms: number;
    connectionsByTenant: Record<string, number>;
    connectionsByOrganization: Record<string, number>;
  } {
    const stats = {
      totalConnections: this.connections.size,
      totalRooms: this.rooms.size,
      connectionsByTenant: {} as Record<string, number>,
      connectionsByOrganization: {} as Record<string, number>,
    };

    for (const connection of this.connections.values()) {
      // 按租户统计
      stats.connectionsByTenant[connection.tenantId] =
        (stats.connectionsByTenant[connection.tenantId] || 0) + 1;

      // 按组织统计
      if (connection.organizationId) {
        stats.connectionsByOrganization[connection.organizationId] =
          (stats.connectionsByOrganization[connection.organizationId] || 0) + 1;
      }
    }

    return stats;
  }
}
