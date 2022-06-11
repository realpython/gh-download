import {
  QUERY_TYPES,
  classifyQuery,
  UnsupportedHost,
  buildFileURL,
  buildSubDirURL,
} from "../src/query.js";
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

  it("should classify repo URL at specific commit as SUBDIR", function () {
    assert.equal(
      classifyQuery(
        "https://github.com/realpython/dockerizing-django/tree/d3dc0dd9d2450f51c75337083edcdd4597f4ec1d"
      ),
      QUERY_TYPES.SUBDIR
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

describe("Build File URLs", function () {
  it("should build raw URL from FILE type URL", function () {
    assert.equal(
      buildFileURL(
        "https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py"
      ),
      "https://raw.githubusercontent.com/realpython/materials/master/python-eval-mathrepl/mathrepl.py"
    );
  });

  it("should build raw URL from FILE type URL with specific SHA", function () {
    assert.equal(
      buildFileURL(
        "https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py"
      ),
      "https://raw.githubusercontent.com/realpython/materials/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py"
    );
  });

  it("should create API url from first level subdir", function () {
    assert.equal(
      buildSubDirURL(
        "https://github.com/realpython/materials/tree/master/python-yaml"
      ),
      "https://api.github.com/repos/realpython/materials/contents/python-yaml?ref=master"
    );
  });

  it("should create API url from SHA specified subdir", function () {
    assert.equal(
      buildSubDirURL(
        "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4"
      ),
      "https://api.github.com/repos/realpython/materials/contents/web-scraping-bs4?ref=7010df1c142cefe717be3ccb406b914b7cd5677e"
    );
  });

  it("should create API url from SHA specified whole repo", function () {
    assert.equal(
      buildSubDirURL(
        "https://github.com/realpython/dockerizing-django/tree/d3dc0dd9d2450f51c75337083edcdd4597f4ec1d"
      ),
      "https://api.github.com/repos/realpython/dockerizing-django/contents/?ref=d3dc0dd9d2450f51c75337083edcdd4597f4ec1d"
    );
  });

  it("should create API url from named branch whole repo", function () {
    assert.equal(
      buildSubDirURL(
        "https://github.com/realpython/flask-boilerplate/tree/updated"
      ),
      "https://api.github.com/repos/realpython/flask-boilerplate/contents/?ref=updated"
    );
  });
});