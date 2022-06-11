import { downloadUrlWithIFrame } from "../src/download.js";

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
  console.log(
    parseInfo(
      "https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4"
    )
  );
}

//test();
// test2();

function test3() {
  saveAs(
    "https://raw.githubusercontent.com/realpython/materials/master/python-eval-mathrepl/mathrepl.py",
    "marthrepl.py"
  );
}

// test3();
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
