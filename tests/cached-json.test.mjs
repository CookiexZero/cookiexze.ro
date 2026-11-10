import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchCachedJson, readCachedJson } from "../src/lib/cached-json.ts";

test("shares concurrent requests and serves fresh data without another fetch", async () => {
  const original = globalThis.fetch;
  let requests = 0;
  let resolve;
  globalThis.fetch = () => {
    requests++;
    return new Promise((done) => {
      resolve = done;
    });
  };
  try {
    const first = fetchCachedJson("https://test.invalid/shared");
    const second = fetchCachedJson("https://test.invalid/shared");
    assert.equal(first, second);
    assert.equal(requests, 1);
    resolve(Response.json({ value: 42 }));
    assert.deepEqual(await first, { value: 42 });
    assert.deepEqual(await fetchCachedJson("https://test.invalid/shared"), {
      value: 42,
    });
    assert.deepEqual(readCachedJson("https://test.invalid/shared"), {
      value: 42,
    });
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("refreshes expired data, retains the last good snapshot and retries failures", async () => {
  const original = globalThis.fetch;
  const originalNow = Date.now;
  let now = 1000;
  let requests = 0;
  Date.now = () => now;
  globalThis.fetch = async () => {
    requests++;
    return requests === 2
      ? new Response("", { status: 503 })
      : Response.json({ value: requests });
  };
  try {
    const url = "https://test.invalid/refresh";
    assert.deepEqual(await fetchCachedJson(url), { value: 1 });
    now += 5 * 60_000 + 1;
    await assert.rejects(fetchCachedJson(url), /503/);
    assert.deepEqual(readCachedJson(url), { value: 1 });
    assert.deepEqual(await fetchCachedJson(url), { value: 3 });
    assert.equal(requests, 3);
  } finally {
    globalThis.fetch = original;
    Date.now = originalNow;
  }
});
