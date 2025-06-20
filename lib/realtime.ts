import axios from 'axios';
import { logger } from './utils/logger';

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:3001';

/**
 * Emits a real-time event to the WebSocket server.
 * @param {string} event - The name of the event (e.g., 'disaster_updated').
 * @param {string} room - The room to broadcast to (e.g., 'disaster_123').
 * @param {object} data - The payload to send with the event.
 */
export const emitRealtimeEvent = async (event: string, room: string, data: any) => {
  try {
    await axios.post(`${SOCKET_SERVER_URL}/emit`, {
      event,
      room,
      data
    });
    logger.debug(`Successfully emitted event "${event}" to room "${room}"`);
  } catch (error: any) {
    logger.error('Failed to emit real-time event:', {
      event,
      room,
      error: error.message,
    });
  }
}; 