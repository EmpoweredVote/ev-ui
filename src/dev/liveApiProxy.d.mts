import type { ProxyOptions } from "vite";

export declare const LIVE_API_ORIGIN: "https://accounts-api.empowered.vote";

export declare function liveApiProxy(options?: { target?: string }): Record<string, ProxyOptions>;

export declare function warnIfAbsoluteApiUrl(
  env: Record<string, string | undefined>,
  log?: (message: string) => void,
): boolean;
