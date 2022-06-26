import {
  QUERY_TYPES,
  UnsupportedHost,
  MaterialsQuery,
  Query,
} from "../src/query.js";
import { JSDOM } from "jsdom";

import fetch, {
  Blob,
  blobFrom,
  blobFromSync,
  File,
  fileFrom,
  fileFromSync,
  FormData,
  Headers,
  Request,
  Response,
} from "node-fetch";

import assert from "assert/strict";

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

function getWindowWithUrlQuery(urlQuery) {
  return new JSDOM(``, {
    url: `https://example.org/?url=${encodeURIComponent(urlQuery)}`,
  }).window;
}

class QueryTest {
  constructor({
    url,
    expectType,
    expectValue,
    expectSrcCodeUrl,
    expectDownloadCallback,
  }) {
    this.url = url;
    this.expectType = expectType;
    this.expectValue = expectValue;
    this.expectSrcCodeUrl = expectSrcCodeUrl;
    this.expectDownloadCallback = expectDownloadCallback;

    if (
      (Error.isPrototypeOf(this.expectType) || this.expectType === Error) &&
      (this.expectSrcCodeUrl !== undefined ||
        this.expectDownloadCallback !== undefined)
    ) {
      throw new Error(
        "If fails on initialization no point in expecting srccode or downloadcallback"
      );
    }

    if (
      (Error.isPrototypeOf(this.expectSrcCodeUrl) ||
        this.expectSrcCodeUrl === Error) &&
      this.expectDownloadCallback !== undefined
    ) {
      throw new Error(
        "If fails on getting source code url no point in expecting downloadcallback"
      );
    }

    if (
      this.expectDownloadCallback !== undefined &&
      typeof this.expectDownloadCallback !== "boolean"
    ) {
      throw new Error("expectDownloadCallback can only be true or false");
    }
  }
}

describe("Query 'url' parameter", function () {
  const tests = [
    new QueryTest({
      url: "https://github.com/rahmonov/alcazar",
      expectType: QUERY_TYPES.BASE_REPO,
      expectSrcCodeUrl: "same",
      expectDownloadCallback: false,
    }),
    new QueryTest({
      url: "https://github.com/realpython/materials/tree/master/python-yaml",
      expectType: QUERY_TYPES.SUBDIR,
      expectSrcCodeUrl: "same",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4",
      expectType: QUERY_TYPES.SUBDIR,
      expectSrcCodeUrl: "same",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "https://github.com/realpython/dockerizing-django/archive/master.zip",
      expectType: QUERY_TYPES.ZIP,
      expectSrcCodeUrl: "https://github.com/realpython/dockerizing-django",
      expectDownloadCallback: false,
    }),
    new QueryTest({
      url: "https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py",
      expectType: QUERY_TYPES.FILE,
      expectSrcCodeUrl: "same",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py",
      expectType: QUERY_TYPES.FILE,
      expectSrcCodeUrl: "same",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "https://github.com/realpython/dockerizing-django/tree/d3dc0dd9d2450f51c75337083edcdd4597f4ec1d",
      expectType: QUERY_TYPES.SUBDIR,
      expectSrcCodeUrl: "same",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "generator",
      expectType: Error,
    }),
    new QueryTest({
      url: "https://hackhub.com/rahmonov/alcazar",
      expectType: UnsupportedHost,
    }),
    new QueryTest({
      url: "https://github.com/rahmooonov/alcazario",
      expectType: QUERY_TYPES.BASE_REPO,
      expectSrcCodeUrl: Error,
    }),
    new QueryTest({
      url: "https://github.com/realpythouououn/materialize/tree/master/python-yaml",
      expectType: QUERY_TYPES.SUBDIR,
      expectSrcCodeUrl: Error,
    }),
    // new QueryTest({
    //   url: "",
    //   expectType: QUERY_TYPES.FILE,
    //   expectSrcCodeUrl: "",
    //   expectDownloadCallback: true,
    // }),
  ];
  for (const test of tests) {
    describe(`${test.url}`, async function () {
      // INITIALIZATION
      // ==============
      if (Error.isPrototypeOf(test.expectType) || Error === test.expectType) {
        it(`Should throw error on initialization`, function () {
          global.window = getWindowWithUrlQuery(test.url);
          assert.throws(function () {
            new MaterialsQuery();
          }, test.expectType);
        });
      } else {
        it(`Should be type ${test.expectType}`, function () {
          global.window = getWindowWithUrlQuery(test.url);
          assert.equal(new MaterialsQuery().type, test.expectType);
        });

        // SOURCE CODE LINK
        // ================
        if (
          Error.isPrototypeOf(test.expectSrcCodeUrl) ||
          Error === test.expectSrcCodeUrl
        ) {
          it(`Should throw error on fetching srcCodeLink`, async function () {
            global.window = getWindowWithUrlQuery(test.url);

            await assert.rejects(async function () {
              await new MaterialsQuery().getSourceCodeLink();
            });
          });
        } else {
          if (test.expectSrcCodeUrl === "same") {
            it(`Should have same source code download link`, async function () {
              global.window = getWindowWithUrlQuery(test.url);
              assert.equal(
                (await new MaterialsQuery().getSourceCodeLink()).toString(),
                test.url
              );
            });
          } else {
            it(`Should have source download link of ${test.expectSrcCodeUrl}`, async function () {
              global.window = getWindowWithUrlQuery(test.url);
              assert.equal(
                (await new MaterialsQuery().getSourceCodeLink()).toString(),
                test.expectSrcCodeUrl
              );
            });
          }

          // DOWNLOAD CALLBACK
          // =================
          it(`Should${
            test.expectDownloadCallback ? " " : " NOT "
          }have download callback`, function () {
            global.window = getWindowWithUrlQuery(test.url);

            assert.strictEqual(
              new MaterialsQuery().downloadCallback instanceof Function,
              test.expectDownloadCallback
            );
          });
        }
      }
    });
  }
});
