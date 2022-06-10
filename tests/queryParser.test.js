import { getQuery, parseInfo, classifyQuery } from "/src/queryParser.js";

function setURL(newURL) {
  if (window.location.href !== newURL) {
    window.location.replace(newURL);
  }
}

function setQuery(query) {
  if (
    window.location.href !==
    window.location.origin + window.location.pathname + "?" + query
  ) {
    setURL(window.location.origin + window.location.pathname + "?" + query);
  }
}

function test() {
  // setQuery("generators");
  // if (getQuery() !== "?generators") {
  //   console.log("pass");
  // } else throw new Error();

  console.log(encodeURIComponent("https://github.com/rahmonov/alcazar"));
  console.log(
    decodeURIComponent(
      "https:%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Ftree%2Fmaster%2Fgenerators"
    )
  );

  setQuery(encodeURIComponent("https://github.com/rahmonov/alcazar"));

  console.log(parseInfo(window.location.href));
}

function test2() {
  classifyQuery("https://github.com/rahmonov/alcazar");
  classifyQuery(
    "https://github.com/realpython/materials/tree/master/python-yaml"
  );
  classifyQuery(
    "https://github.com/python-web-scraping-examples/archive/master.zip"
  );
  classifyQuery(
    "https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py"
  );
  classifyQuery(
    "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4"
  );
  classifyQuery("generators");
  classifyQuery("https://githubbb.com/rahmonov/alcazar");
}

//test();
test2();

/*
A- WHOLE REPOSITORY - https://github.com/rahmonov/alcazar
B- SUBDIRECTORY - https://github.com/realpython/materials/tree/master/python-yaml
C- ZIP FILE - https://github.com/python-web-scraping-examples/archive/master.zip
D- SINGLE FILE - https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py
E- SPECIFIC BRANCH - https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4
F- SINGLE WORD - generator (my version!)

?url=https:%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Ftree%2Fmaster%2Fgenerators

*/
