/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Polyfill TextEncoder for undici/Cheerio
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder } = require("util");
  global.TextEncoder = TextEncoder;
}

// Polyfill TextDecoder for undici/Cheerio
if (typeof global.TextDecoder === "undefined") {
  const { TextDecoder } = require("util");
  global.TextDecoder = TextDecoder;
}

// Polyfill ReadableStream for undici/Cheerio
if (typeof global.ReadableStream === "undefined") {
  try {
    global.ReadableStream =
      require("web-streams-polyfill/ponyfill").ReadableStream;
  } catch (e) {
    global.ReadableStream = function () {};
  }
}

// Polyfill MessagePort for undici/Cheerio
if (typeof global.MessagePort === "undefined") {
  global.MessagePort = function () {};
}
