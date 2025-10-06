/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    krpano: any;
    embedpano: (config: {
      xml: string;
      target: string;
      html5?: string;
      mobilescale?: number;
      passQueryParameters?: boolean;
    }) => void;
  }
}

export {};
