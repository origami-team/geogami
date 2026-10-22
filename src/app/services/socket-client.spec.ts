import { TestBed } from "@angular/core/testing";
import io from "socket.io-client";
import { SOCKET_CONFIG, SOCKET_IO, Socket } from "./socket-client";

describe("Socket (the app's Socket.IO client)", () => {
  describe("with a stand-in connection", () => {
    let underlying: any;
    let connect: jasmine.Spy;

    const create = (config: any = { url: "https://api.example.org", options: { a: 1 } }) => new Socket(config, connect as any);

    beforeEach(() => {
      underlying = {};
      for (const method of ["on", "emit", "connect", "disconnect", "removeListener", "removeAllListeners"]) {
        underlying[method] = jasmine.createSpy(method).and.returnValue(underlying);
      }
      underlying.connected = false;
      connect = jasmine.createSpy("io").and.returnValue(underlying);
    });

    it("opens one connection when it is created, to the configured address with the configured options", () => {
      const socket = create();
      expect(connect).toHaveBeenCalledTimes(1);
      expect(connect).toHaveBeenCalledWith("https://api.example.org", { a: 1 });
      socket.emit("x");
      socket.connect();
      expect(connect).toHaveBeenCalledTimes(1);
    });

    it("exposes the underlying socket, so its state can be read", () => {
      const socket = create();
      expect(socket.ioSocket).toBe(underlying);
      underlying.connected = true;
      expect(socket.ioSocket.connected).toBe(true);
    });

    it("hands events and callbacks to the connection", () => {
      const socket = create();
      const callback = () => {};
      socket.on("updateAvatarPosition", callback);
      expect(underlying.on).toHaveBeenCalledWith("updateAvatarPosition", callback);
    });

    it("emits with all its arguments, including an acknowledgement callback, and returns what the connection returns", () => {
      const socket = create();
      const ack = () => {};
      const result = socket.emit("checkRoomNameExistance_v2", { gameCode: "Alice" }, ack);
      expect(underlying.emit).toHaveBeenCalledWith("checkRoomNameExistance_v2", { gameCode: "Alice" }, ack);
      expect(underlying.emit.calls.argsFor(0).length).toBe(3);
      expect(result).toBe(underlying);
      socket.emit("closeVEGame");
      expect(underlying.emit.calls.argsFor(1)).toEqual(["closeVEGame"]);
    });

    it("connects and disconnects", () => {
      const socket = create();
      expect(socket.connect()).toBe(underlying);
      expect(underlying.connect).toHaveBeenCalledTimes(1);
      socket.disconnect();
      expect(underlying.disconnect.calls.argsFor(0)).toEqual([]); // no stray arguments
      socket.disconnect(true);
      expect(underlying.disconnect.calls.argsFor(1)).toEqual([true]);
    });

    it("passes on exactly the arguments given to removeListener and removeAllListeners (their count matters)", () => {
      const socket = create();
      const callback = () => {};
      socket.removeListener("closeWebGLFrame");
      socket.removeListener("reconnect", callback);
      socket.removeAllListeners();
      socket.removeAllListeners("reconnect");
      expect(underlying.removeListener.calls.argsFor(0)).toEqual(["closeWebGLFrame"]);
      expect(underlying.removeListener.calls.argsFor(1)).toEqual(["reconnect", callback]);
      expect(underlying.removeAllListeners.calls.argsFor(0)).toEqual([]);
      expect(underlying.removeAllListeners.calls.argsFor(1)).toEqual(["reconnect"]);
    });
  });

  // The same, against the real socket.io-client (not connecting anywhere).
  describe("with the real socket.io-client", () => {
    const create = () => new Socket({ url: "http://127.0.0.1:1", options: { autoConnect: false } }, io);
    const count = (socket: Socket, event: string) => (socket.ioSocket as any).listeners(event).length;

    it("removeListener(event) removes every handler of the event", () => {
      const socket = create();
      socket.on("closeWebGLFrame", () => {});
      socket.on("closeWebGLFrame", () => {});
      expect(count(socket, "closeWebGLFrame")).toBe(2);
      socket.removeListener("closeWebGLFrame");
      expect(count(socket, "closeWebGLFrame")).toBe(0);
    });

    it("removeListener(event, callback) removes only that handler", () => {
      const socket = create();
      const keep = () => {};
      const drop = () => {};
      socket.on("reconnect", keep);
      socket.on("reconnect", drop);
      socket.removeListener("reconnect", drop);
      expect((socket.ioSocket as any).listeners("reconnect")).toEqual([keep]);
    });

    it("removeAllListeners() removes the handlers of all events", () => {
      const socket = create();
      socket.on("a", () => {});
      socket.on("b", () => {});
      socket.removeAllListeners();
      expect(count(socket, "a") + count(socket, "b")).toBe(0);
    });

    it("does not connect when told not to, and reports that", () => {
      const socket = create();
      expect(socket.ioSocket.connected).toBe(false);
    });
  });

  describe("as an injectable", () => {
    it("is created lazily, on first use, and is a single shared instance", () => {
      const connect = jasmine.createSpy("io").and.returnValue({ on() {}, emit() {} });
      TestBed.configureTestingModule({
        providers: [
          { provide: SOCKET_CONFIG, useValue: { url: "https://api.example.org", options: {} } },
          { provide: SOCKET_IO, useValue: connect },
        ],
      });
      expect(connect).not.toHaveBeenCalled(); // nothing connects until something asks for the socket
      const first = TestBed.inject(Socket);
      expect(connect).toHaveBeenCalledTimes(1);
      expect(TestBed.inject(Socket)).toBe(first);
      expect(connect).toHaveBeenCalledTimes(1);
    });

    it("uses the real socket.io-client unless told otherwise", () => {
      expect(TestBed.inject(SOCKET_IO)).toBe(io);
    });
  });
});
