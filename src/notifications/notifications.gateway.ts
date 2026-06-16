import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  path: '/socket.io/', 
  cors: {
    origin: [
      'http://localhost:3000',
      'http://192.168.100.7:3000',
      'https://techero-iota.vercel.app',
      'https://techero.ge'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
 })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;
}
