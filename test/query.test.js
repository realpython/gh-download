import {
  QUERY_TYPES,
  UnsupportedHost,
  MaterialsQuery,
  Query,
} from "../src/query.js";
import { JSDOM } from "jsdom";
import assert from "assert";
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
  }
}

describe("Classify URLs", function () {
  const tests = [
    new QueryTest({
      url: "https://github.com/rahmonov/alcazar",
      expectType: QUERY_TYPES.BASE_REPO,
      expectSrcCodeUrl: "https://github.com/rahmonov/alcazar",
      expectDownloadCallback: false,
    }),
    new QueryTest({
      url: "https://github.com/realpython/materials/tree/master/python-yaml",
      expectType: QUERY_TYPES.SUBDIR,
      expectSrcCodeUrl:
        "https://github.com/realpython/materials/tree/master/python-yaml",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4",
      expectType: QUERY_TYPES.SUBDIR,
      expectSrcCodeUrl:
        "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4",
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
      expectSrcCodeUrl:
        "https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py",
      expectType: QUERY_TYPES.FILE,
      expectSrcCodeUrl:
        "https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "https://github.com/realpython/dockerizing-django/tree/d3dc0dd9d2450f51c75337083edcdd4597f4ec1d",
      expectType: QUERY_TYPES.SUBDIR,
      expectSrcCodeUrl:
        "https://github.com/realpython/dockerizing-django/tree/d3dc0dd9d2450f51c75337083edcdd4597f4ec1d",
      expectDownloadCallback: true,
    }),
    new QueryTest({
      url: "generator",
      expectType: Error,
      expectSrcCodeUrl: Error,
      expectDownloadCallback: Error,
    }),
    new QueryTest({
      url: "https://hackhub.com/rahmonov/alcazar",
      expectType: Error,
      expectSrcCodeUrl: Error,
      expectDownloadCallback: Error,
    }),
    // new QueryTest({
    //   url: "",
    //   expectType: QUERY_TYPES.FILE,
    //   expectSrcCodeUrl: "",
    //   expectDownloadCallback: true,
    // }),
  ];

  tests.forEach((test) => {
    it(`${test.url} should be type ${test.expectType}`, function () {
      global.window = getWindowWithUrlQuery(test.url);
      if (test.expectType == Error) {
        assert.throws(function () {
          new MaterialsQuery();
        }, test.expectType);
      } else {
        assert.equal(new MaterialsQuery().type, test.expectType);
      }
    });

    it(`${test.url} should have source download link of ${test.expectSrcCodeUrl}`, async function () {
      global.window = getWindowWithUrlQuery(test.url);
      if (test.expectType == Error) {
        assert.rejects(async function () {
          await new MaterialsQuery().getSourceCodeLink();
        });
      } else if (test.expectSrcCodeUrl !== null) {
        assert.equal(
          await new MaterialsQuery().getSourceCodeLink(),
          test.expectSrcCodeUrl
        );
      } else {
        assert.equal(
          await new MaterialsQuery().getSourceCodeLink(),
          test.expectSrcCodeUrl
        );
      }
    });

    it(`${test.url} SHOULD${
      test.expectDownloadCallback ? " " : " NOT "
    }have download callback`, function () {
      global.window = getWindowWithUrlQuery(test.url);
      if (test.expectDownloadCallback == Error) {
        assert.throws(function () {
          new MaterialsQuery();
        }, Error);
      } else {
        assert.strictEqual(
          new MaterialsQuery().downloadCallback instanceof Function,
          test.expectDownloadCallback
        );
      }
    });
  });
});
