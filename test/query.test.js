import { QUERY_TYPES, classifyQuery, UnsupportedHost } from "../src/query.js";
import assert from "assert";

describe("Classify URLs", function () {
  it("should classify REPO URL", function () {
    assert.equal(
      classifyQuery("https://github.com/rahmonov/alcazar"),
      QUERY_TYPES.REPO
    );
  });

  it("should classify SUBDIR URL master branch", function () {
    assert.equal(
      classifyQuery(
        "https://github.com/realpython/materials/tree/master/python-yaml"
      ),
      QUERY_TYPES.SUBDIR
    );
  });

  it("should classify SUBDIR URL at specific commit", function () {
    assert.equal(
      classifyQuery(
        "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4"
      ),
      QUERY_TYPES.SUBDIR
    );
  });

  it("should classify ZIP URL", function () {
    assert.equal(
      classifyQuery(
        "https://github.com/realpython/dockerizing-django/archive/master.zip"
      ),
      QUERY_TYPES.ZIP
    );
  });

  it("should classify FILE URL", function () {
    assert.equal(
      classifyQuery(
        "https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py"
      ),
      QUERY_TYPES.FILE
    );
  });

  it("should classify FILE URL at specific commit", function () {
    assert.equal(
      classifyQuery(
        "https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py"
      ),
      QUERY_TYPES.FILE
    );
  });

  it("should classify WORD", function () {
    assert.equal(classifyQuery("generator"), QUERY_TYPES.WORD);
  });

  it("should fail to classify non GitHub host", function () {
    assert.throws(function () {
      classifyQuery("https://hackhub.com/rahmonov/alcazar");
    }, UnsupportedHost);
  });
});
