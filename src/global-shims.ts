// Polyfills for Node globals (needed by megajs)
(window as any).global = window;
(window as any).process = { env: {} };

// Some MEGA internals expect Buffer
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
