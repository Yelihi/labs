import console from 'node:console';
import process from 'node:process';
import { createLabServer } from './server.mjs';

const server = createLabServer();
server.listen(3001, '127.0.0.1', () => console.log('Lab server: http://127.0.0.1:3001'));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close();
    server.closeAllConnections();
  });
}
