import io from "socket.io-client";

const SOCKET_URL = `https://idish-2.vercel.app`;
const socket = io(SOCKET_URL, { transports: ["websocket"] });

export default socket;
