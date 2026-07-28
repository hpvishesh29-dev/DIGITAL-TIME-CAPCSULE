export const logger = {
  info: (msg, meta = '') => {
    console.log(`[CHRONA INFO ${new Date().toISOString()}] ${msg}`, meta);
  },
  warn: (msg, meta = '') => {
    console.warn(`[CHRONA WARN ${new Date().toISOString()}] ${msg}`, meta);
  },
  error: (msg, meta = '') => {
    console.error(`[CHRONA ERROR ${new Date().toISOString()}] ${msg}`, meta);
  },
};
