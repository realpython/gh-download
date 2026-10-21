export const ERROR_TYPE = {
  API_LIMIT: "API_LIMIT",
  NOT_FOUND: "NOT_FOUND",
  INVALID_URL: "INVALID_URL",
};

/**
 * Map a failed GitHub response (API or raw) to an `Error` whose message is an
 * `ERROR_TYPE`, or a generic `Error` if the cause is unknown.
 * @async
 * @param {Response} resp
 * @returns {Promise<Error>}
 */
export async function errorFromResponse(resp) {
  if (resp.status === 404) return new Error(ERROR_TYPE.NOT_FOUND);
  if (resp.status === 429 || resp.headers.get("x-ratelimit-remaining") === "0")
    return new Error(ERROR_TYPE.API_LIMIT);

  const body = await resp.text().catch(() => "");
  if (body.includes("rate limit")) return new Error(ERROR_TYPE.API_LIMIT);

  return new Error(`GitHub request failed: ${resp.status} ${resp.url}`);
}
