import {
  QUERY_TYPES,
  UnsupportedHost,
  MaterialsQuery,
  Query,
} from "../src/query.js";
import { JSDOM } from "jsdom";
import assert from "assert";

function getWindowWithUrlQuery(urlQuery) {
  return new JSDOM(``, {
    url: `https://example.org/?url=${encodeURIComponent(urlQuery)}`,
  }).window;
}

describe("Classify URLs", function () {
  it("should fail to classify REPO URL", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/rahmonov/alcazar"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.BASE_REPO);
  });

  it("should classify SUBDIR URL master branch", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/realpython/materials/tree/master/python-yaml"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.SUBDIR);
  });

  it("should classify SUBDIR URL at specific commit", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.SUBDIR);
  });

  it("should fail to classify ZIP URL", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/realpython/dockerizing-django/archive/master.zip"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.ZIP);
  });

  it("should classify FILE URL", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.FILE);
  });

  it("should classify FILE URL at specific commit", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.FILE);
  });

  it("should classify repo URL at specific commit as SUBDIR", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/realpython/dockerizing-django/tree/d3dc0dd9d2450f51c75337083edcdd4597f4ec1d"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.SUBDIR);
  });

  it("should fail to classify WORD", function () {
    global.window = getWindowWithUrlQuery("generator");
    assert.throws(function () {
      new MaterialsQuery();
    }, Error);
  });

  it("should fail to classify non GitHub host", function () {
    global.window = getWindowWithUrlQuery(
      "https://hackhub.com/rahmonov/alcazar"
    );
    assert.throws(function () {
      new MaterialsQuery();
    }, UnsupportedHost);
  });
});

describe("Build File URLs", function () {
  it("should build raw URL from FILE type URL", function () {
    assert.equal(
      MaterialsQuery.apiUrlFromFileUrl(
        "https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py"
      ),
      "https://raw.githubusercontent.com/realpython/materials/master/python-eval-mathrepl/mathrepl.py"
    );
  });

  it("should build raw URL from FILE type URL with specific SHA", function () {
    assert.equal(
      MaterialsQuery.apiUrlFromFileUrl(
        "https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py"
      ),
      "https://raw.githubusercontent.com/realpython/materials/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py"
    );
  });

  it("should create API url from first level subdir", function () {
    assert.equal(
      MaterialsQuery.apiUrlFromSubDirUrl(
        "https://github.com/realpython/materials/tree/master/python-yaml"
      ),
      "https://api.github.com/repos/realpython/materials/contents/python-yaml?ref=master"
    );
  });

  it("should create API url from SHA specified subdir", function () {
    assert.equal(
      MaterialsQuery.apiUrlFromSubDirUrl(
        "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4"
      ),
      "https://api.github.com/repos/realpython/materials/contents/web-scraping-bs4?ref=7010df1c142cefe717be3ccb406b914b7cd5677e"
    );
  });

  it("should create API url from SHA specified whole repo", function () {
    assert.strictEqual(
      MaterialsQuery.apiUrlFromSubDirUrl(
        "https://github.com/realpython/dockerizing-django/tree/d3dc0dd9d2450f51c75337083edcdd4597f4ec1d"
      ),
      "https://api.github.com/repos/realpython/dockerizing-django/contents/?ref=d3dc0dd9d2450f51c75337083edcdd4597f4ec1d"
    );
  });

  it("should create API url from named branch whole repo", function () {
    assert.strictEqual(
      MaterialsQuery.apiUrlFromSubDirUrl(
        "https://github.com/realpython/flask-boilerplate/tree/updated"
      ),
      "https://api.github.com/repos/realpython/flask-boilerplate/contents/?ref=updated"
    );
  });

  it("should grab the file name from a file url", function () {
    assert.strictEqual(
      MaterialsQuery.fileNameFromUrl(
        "https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py"
      ),
      "mathrepl.py"
    );
  });
});

describe("Edge-case URLs", function () {
  it("should classify REPO URL with trailing slash", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/realpython/materials/"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.BASE_REPO);
  });

  it("should accept www.github.com", function () {
    global.window = getWindowWithUrlQuery(
      "https://www.github.com/realpython/materials/tree/master/python-yaml"
    );
    assert.equal(new MaterialsQuery().type, QUERY_TYPES.SUBDIR);
  });

  it("should only classify paths ending in .zip as ZIP", function () {
    global.window = getWindowWithUrlQuery(
      "https://github.com/realpython/materials/archive/fooxzip"
    );
    assert.throws(() => new MaterialsQuery(), Error);
  });

  it("should reject a GitHub URL without a repo", function () {
    global.window = getWindowWithUrlQuery("https://github.com/realpython");
    assert.throws(() => new MaterialsQuery(), Error);
  });

  it("should reject a query without a url key", function () {
    global.window = new JSDOM(``, {
      url: "https://example.org/?foo=bar",
    }).window;
    assert.throws(() => new MaterialsQuery(), Error);
  });

  it("should have a download callback for every type", function () {
    for (const url of [
      "https://github.com/realpython/materials",
      "https://github.com/realpython/materials/archive/master.zip",
      "https://github.com/realpython/materials/tree/master/python-yaml",
      "https://github.com/realpython/materials/blob/master/README.md",
    ]) {
      global.window = getWindowWithUrlQuery(url);
      assert.equal(typeof new MaterialsQuery().downloadCallback, "function");
    }
  });
});

describe("Default branch and names", function () {
  it("should build an archive URL that follows the default branch", function () {
    assert.strictEqual(
      MaterialsQuery.zipUrlFromRepoUrl("https://github.com/realpython/materials/"),
      "https://github.com/realpython/materials/archive/HEAD.zip"
    );
  });

  it("should check repos without assuming a master branch", function () {
    assert.strictEqual(
      MaterialsQuery.apiUrlFromZipUrl(
        "https://github.com/realpython/materials/archive/main.zip"
      ),
      "https://api.github.com/repos/realpython/materials"
    );
  });

  it("should not end subdir names with a dash on trailing slash", function () {
    assert.strictEqual(
      MaterialsQuery.subDirNameFromSubDirUrl(
        MaterialsQuery.apiUrlFromSubDirUrl(
          "https://github.com/realpython/materials/tree/master/python-yaml/"
        )
      ),
      "materials-python-yaml"
    );
  });

  it("should decode file names", function () {
    assert.strictEqual(
      MaterialsQuery.fileNameFromUrl(
        "https://raw.githubusercontent.com/realpython/materials/master/x/my%20file.py"
      ),
      "my file.py"
    );
  });
});
