import { Inject, Injectable, InjectionToken } from '@angular/core';
import io from 'socket.io-client';

// The connection to the GeoGami API's Socket.IO endpoint. Socket.IO 2.x, the same protocol the
// API and the apps in the stores speak.
//
// This is the part of ngx-socket-io that the app used (that library is a thin wrapper around
// socket.io-client and was never compiled for newer Angular versions), with the same behaviour:
// the connection is created the first time something injects `Socket` and starts connecting
// right away; the methods hand their arguments straight to socket.io-client.

export interface SocketConfig {
  url: string;
  options?: SocketIOClient.ConnectOpts;
}

export const SOCKET_CONFIG = new InjectionToken<SocketConfig>('SOCKET_CONFIG');

/** How a connection is made. A token only so that tests can use a stand-in. */
export const SOCKET_IO = new InjectionToken<typeof io>('SOCKET_IO', {
  providedIn: 'root',
  factory: () => io,
});

@Injectable({ providedIn: 'root' })
export class Socket {
  /** The underlying socket.io-client socket (the app reads `ioSocket.connected`). */
  readonly ioSocket: SocketIOClient.Socket;

  constructor(
    @Inject(SOCKET_CONFIG) config: SocketConfig,
    @Inject(SOCKET_IO) connect: typeof io
  ) {
    this.ioSocket = connect(config.url, config.options);
  }

  on(eventName: string, callback: Function): void {
    this.ioSocket.on(eventName, callback);
  }

  emit(eventName: string, ...args: any[]): SocketIOClient.Socket {
    return this.ioSocket.emit(eventName, ...args);
  }

  connect(): SocketIOClient.Socket {
    return this.ioSocket.connect();
  }

  // The next three pass on exactly the arguments they were called with, no more: socket.io-client
  // tells "removeListener(event)" (remove every handler of the event) from
  // "removeListener(event, undefined)" (remove none) by the NUMBER of arguments.
  disconnect(...args: any[]): SocketIOClient.Socket {
    return this.ioSocket.disconnect.apply(this.ioSocket, args as []);
  }

  removeListener(...args: [eventName: string, callback?: Function]): SocketIOClient.Emitter {
    return this.ioSocket.removeListener.apply(this.ioSocket, args as [string]);
  }

  removeAllListeners(...args: [eventName?: string]): SocketIOClient.Emitter {
    return this.ioSocket.removeAllListeners.apply(this.ioSocket, args as []);
  }
}
