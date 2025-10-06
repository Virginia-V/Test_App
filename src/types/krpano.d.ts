/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    krpano?: any;
    embedpano?: (opts: any) => void;
  }
}

export {};
