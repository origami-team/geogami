import http from "node:http";
import type { AddressInfo } from "node:net";
import SocketIO from "socket.io";
import ioClient from "socket.io-client";

/**
 * A real Socket.IO 2.x server (the same versions as the GeoGami API: socket.io 2.5.1 / engine.io 3.6.2)
 * that answers the events of the virtual-environment flow the way the API does
 * (geogami-server/src/index.js: newGame, joinVEGame, checkRoomNameExistance_v2, closeVEGame).
 * It records everything it receives so tests can check what the app sent.
 */
export class TestSocketServer {
  readonly received: { event: string; args: any[]; socketId: string }[] = [];
  private readonly sockets = new Map<string, SocketIO.Socket>();
  private readonly roomOf: Record<string, string> = {};
  private readonly others: any[] = [];
  private constructor(private readonly server: http.Server, readonly io: SocketIO.Server, readonly url: string) {}

  static async start(): Promise<TestSocketServer> {
    const server = http.createServer();
    const io = SocketIO(server, { serveClient: false, origins: "*:*" });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const instance = new TestSocketServer(server, io, `http://127.0.0.1:${(server.address() as AddressInfo).port}`);
    instance.wire();
    return instance;
  }

  private wire() {
    this.io.on("connection", (socket) => {
      this.sockets.set(socket.id, socket);
      socket.on("disconnect", () => this.sockets.delete(socket.id));
      // record every incoming event (acknowledgement callbacks are left out)
      socket.use((packet, next) => {
        const [event, ...args] = packet;
        this.received.push({ event, args: args.filter((a) => typeof a !== "function"), socketId: socket.id });
        next();
      });

      // The GeoGami app creates/joins the room with newGame { gameCode } ...
      socket.on("newGame", (data) => {
        socket.join(data.gameCode);
        this.roomOf[socket.id] = data.gameCode;
      });
      // ... and the Unity VE joins the same room with joinVEGame { playerName } (as in the API,
      // handleJoinVEGame: "It should be playername for both single and multiplayer mods").
      // The API would join a room called "undefined" for a payload without playerName; here such a
      // join is ignored, so a wrong payload shows up in a test as a missing room member.
      socket.on("joinVEGame", (data) => {
        if (!data || typeof data.playerName !== "string") return;
        socket.join(data.playerName);
        this.roomOf[socket.id] = data.playerName;
      });
      socket.on("checkRoomNameExistance_v2", (data, callback) => {
        callback({ roomStatus: !!this.io.sockets.adapter.rooms[data.gameCode] });
      });
      socket.on("closeVEGame", () => {
        socket.to(this.roomOf[socket.id]).emit("closeWebGLFrame");
      });
      socket.on("pingServer", () => {});
    });
  }

  /** Events of one kind received so far (arguments only). */
  eventsOf(event: string) {
    return this.received.filter((r) => r.event === event);
  }

  /** The ids of the connections currently in a room. */
  membersOf(room: string): string[] {
    const found = this.io.sockets.adapter.rooms[room];
    return found ? Object.keys(found.sockets) : [];
  }

  get connected(): number {
    return this.sockets.size;
  }

  emitToRoom(room: string, event: string, ...args: any[]) {
    this.io.to(room).emit(event, ...args);
  }

  /** Cuts the network connection of every client, like a dropped connection: clients reconnect by themselves. */
  dropAllTransports() {
    for (const socket of this.sockets.values()) {
      (socket as any).conn.close();
    }
  }

  /** Another GeoGami app (another player) that creates/joins a room the way the app does: newGame { gameCode }. */
  async joinAsApp(room: string) {
    const client = await this.connectClient();
    client.emit("newGame", { gameCode: room, virEnvType: "VirEnv_52", isSingleMode: true });
    await this.waitForMember(room);
    return client;
  }

  /** The Unity virtual environment joining a room the way it does: joinVEGame { playerName }. */
  async joinAsUnity(room: string) {
    const client = await this.connectClient();
    client.emit("joinVEGame", { playerName: room });
    await this.waitForMember(room);
    return client;
  }

  private async connectClient() {
    const client = ioClient(this.url, { transports: ["websocket"] });
    this.others.push(client);
    await new Promise<void>((resolve) => client.on("connect", () => resolve()));
    return client;
  }

  private waitForMember(room: string) {
    return new Promise<void>((resolve) => {
      const poll = () => (this.membersOf(room).length ? resolve() : setTimeout(poll, 10));
      poll();
    });
  }

  async close() {
    for (const client of this.others) client.close();
    this.io.close();
    // the browser's long-poll requests are still open: end them, or close() would wait for them
    (this.server as any).closeAllConnections?.();
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }
}
