import net from 'node:net';

const host = 'aws-1-ap-southeast-2.pooler.supabase.com.';
const port = 6543;

console.log(`Connecting to ${host}:${port}...`);

const socket = net.createConnection(port, host, () => {
    console.log('✅ Socket connected successfully!');
    console.log('Remote Address:', socket.remoteAddress);
    socket.end();
});

socket.on('error', (err) => {
    console.error('❌ Socket connection failed!');
    console.error(err);
});

socket.setTimeout(5000, () => {
    console.log('❌ Socket connection timed out');
    socket.destroy();
});
