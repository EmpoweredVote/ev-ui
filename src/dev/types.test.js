// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url)));

describe("./dev export", () => {
  test("ships type declarations so TypeScript consumers can import it", () => {
    const dev = pkg.exports["./dev"];
    expect(dev.types).toBe("./src/dev/liveApiProxy.d.mts");
    expect(pkg.files).toContain("src/dev/liveApiProxy.d.mts");
    const dts = readFileSync(new URL("./liveApiProxy.d.mts", import.meta.url), "utf8");
    for (const name of ["LIVE_API_ORIGIN", "liveApiProxy", "warnIfAbsoluteApiUrl"]) expect(dts).toContain(name);
  });

  test("has a default condition for non-ESM loaders", () => {
    expect(pkg.exports["./dev"].default).toBe("./src/dev/liveApiProxy.mjs");
  });
});
