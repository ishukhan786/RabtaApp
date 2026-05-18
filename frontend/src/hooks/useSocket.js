import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(token) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return undefined;

    const nextSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
      auth: { token },
    });

    setSocket(nextSocket);
    return () => nextSocket.disconnect();
  }, [token]);

  return socket;
}
