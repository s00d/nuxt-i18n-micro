import { describe, expect, it } from "vitest";
import {
  CacheControl,
  DEFAULT_COOKIE_MAX_AGE,
  getHashCookieName,
  getLocaleCookieName,
  getLocaleCookieOptions,
} from "../src";

describe("@i18n-micro/utils cookie helpers", () => {
  it("resolves locale cookie names and hash mode cookie", () => {
    expect(getLocaleCookieName({ localeCookie: null } as any)).toBeNull();
    expect(getLocaleCookieName({ localeCookie: "my-locale" } as any)).toBe("my-locale");
    expect(getHashCookieName({ hashMode: true } as any)).toBe("hash-locale");
    expect(getHashCookieName({ hashMode: false } as any)).toBeNull();
  });

  it("returns stable cookie options shape", () => {
    const opts = getLocaleCookieOptions();
    expect(opts.path).toBe("/");
    expect(opts.sameSite).toBe("lax");
    expect(opts.maxAge).toBe(DEFAULT_COOKIE_MAX_AGE);
    expect(opts.expires).toBeInstanceOf(Date);
  });
});

describe("@i18n-micro/utils cache control", () => {
  it("keeps max size with LRU eviction", () => {
    const cc = new CacheControl<number>({ maxSize: 2 });
    cc.set("a", 1);
    cc.set("b", 2);
    cc.get("a");
    cc.set("c", 3);
    expect(cc.has("a")).toBe(true);
    expect(cc.has("b")).toBe(false);
    expect(cc.has("c")).toBe(true);
  });

  it("expires entries when ttl is reached", async () => {
    const cc = new CacheControl<number>({ ttl: 1 });
    cc.set("x", 1);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(cc.get("x")).toBeUndefined();
  });
});
