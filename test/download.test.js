import { getContents, getFileData } from "../src/download.js";
import { ERROR_TYPE } from "../src/error.js";
import assert from "assert";

function stubFetch(body, init) {
  global.fetch = async () => new Response(body, init);
}

describe("GitHub responses", function () {
  const originalFetch = global.fetch;
  afterEach(() => (global.fetch = originalFetch));

  it("should return file data on success", async function () {
    stubFetch("print('hi')", { status: 200 });
    const data = await getFileData("https://raw.githubusercontent.com/x");
    assert.equal(new TextDecoder().decode(data), "print('hi')");
  });

  it("should not save a 404 page as file contents", async function () {
    stubFetch("404: Not Found", { status: 404 });
    await assert.rejects(
      getFileData("https://raw.githubusercontent.com/x"),
      { message: ERROR_TYPE.NOT_FOUND }
    );
  });

  it("should detect raw rate limiting", async function () {
    stubFetch("Too Many Requests", { status: 429 });
    await assert.rejects(
      getFileData("https://raw.githubusercontent.com/x"),
      { message: ERROR_TYPE.API_LIMIT }
    );
  });

  it("should detect API rate limiting from headers", async function () {
    stubFetch("{}", {
      status: 403,
      headers: { "x-ratelimit-remaining": "0" },
    });
    await assert.rejects(getContents("https://api.github.com/x"), {
      message: ERROR_TYPE.API_LIMIT,
    });
  });

  it("should detect API rate limiting from the message", async function () {
    stubFetch('{"message": "API rate limit exceeded for 1.2.3.4."}', {
      status: 403,
    });
    await assert.rejects(getContents("https://api.github.com/x"), {
      message: ERROR_TYPE.API_LIMIT,
    });
  });

  it("should not crash on a non-JSON server error", async function () {
    stubFetch("<html>Unicorn!</html>", { status: 502 });
    await assert.rejects(getContents("https://api.github.com/x"), (e) =>
      e.message.startsWith("GitHub request failed: 502")
    );
  });
});
