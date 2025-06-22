// Real-time features have been disabled for Vercel deployment.
// This is a stub to prevent import errors.

export const emitRealtimeEvent = async () => {
  if (typeof console !== 'undefined') {
    console.warn('emitRealtimeEvent called, but real-time features are disabled.');
  }
}; 