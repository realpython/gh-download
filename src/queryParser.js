export function getQuery() {
  return window.location.search.slice(1);
}

class UnsupportedHost extends Error {
  constructor(...params) {
    super("URL must be Github", ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsupportedHost);
    }

    this.name = "UnsupportedHost";
  }
}

export function classifyQuery(decodedQuery) {
  // A- WHOLE REPOSITORY - https://github.com/rahmonov/alcazar
  // B- SUBDIRECTORY - https://github.com/realpython/materials/tree/master/python-yaml
  // C- ZIP FILE - https://github.com/python-web-scraping-examples/archive/master.zip
  // D- SINGLE FILE - https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py
  // E- SPECIFIC BRANCH - https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4
  // F- SINGLE WORD - generator (my version!)
  try {
    const url = new URL(decodedQuery);
    console.log(url);
    const ghBase = /https?:\/\/github\.com\//;

    if (url.hostname !== "github.com") throw new UnsupportedHost();

    const path = url.pathname.split("/").slice(1);
    console.log(path, path.slice(-1)[0]);

    if (path.length === 2) {
      console.log("Whole Repository");
    } else if (path.slice(-1)[0].match(".zip")) {
      console.log("ZIP file");
    } else if (path[3] === tree && path[4] === "master") {
      console.log("Subdir");
    }

    const patterns = {
      wholeRepo: new RegExp(ghBase + "[\\w\\d]+\\/[\\w\\d]+$"),
      subDir: new RegExp(ghBase + "[\\w\\d]+\\/tree\\/master\\/[\\w\\d]+$"),
    };

    // var templateUrl = "https?://github.com/.+/.+";
    // var downloadUrlInfix = "#/home?url=";
    // var downloadUrlPrefix =
    //   "https://minhaskamal.github.io/DownGit/" + downloadUrlInfix;

    console.log(url.hostname);
  } catch (e) {
    if (e instanceof UnsupportedHost) throw e;
    if (e instanceof TypeError) {
      console.log(decodedQuery);
    }
  }
}

export function parseInfo(parameters) {
  var repoPath = new URL(parameters).pathname;
  var splitPath = repoPath.split("/");
  var info = {};
  console.log({ repoPath }, { splitPath });

  info.author = splitPath[1];
  info.repository = splitPath[2];
  info.branch = splitPath[4];

  info.rootName = splitPath[splitPath.length - 1];
  if (!!splitPath[4]) {
    info.resPath = repoPath.substring(
      repoPath.indexOf(splitPath[4]) + splitPath[4].length + 1
    );
  }
  info.urlPrefix =
    "https://api.github.com/repos/" +
    info.author +
    "/" +
    info.repository +
    "/contents/";
  info.urlPostfix = "?ref=" + info.branch;

  if (!parameters.fileName || parameters.fileName == "") {
    info.downloadFileName = info.rootName;
  } else {
    info.downloadFileName = parameters.fileName;
  }

  if (parameters.rootDirectory == "false") {
    info.rootDirectoryName = "";
  } else if (
    !parameters.rootDirectory ||
    parameters.rootDirectory == "" ||
    parameters.rootDirectory == "true"
  ) {
    info.rootDirectoryName = info.rootName + "/";
  } else {
    info.rootDirectoryName = parameters.rootDirectory + "/";
  }

  return info;
}

// var templateUrl = "https?://github.com/.+/.+";
// var downloadUrlInfix = "#/home?url=";
// var downloadUrlPrefix =
//   "https://minhaskamal.github.io/DownGit/" + downloadUrlInfix;

// if ($routeParams.url) {
//   $scope.url = $routeParams.url;
// }

// if ($scope.url.match(templateUrl)) {
//   var parameter = {
//     url: $routeParams.url,
//     fileName: $routeParams.fileName,
//     rootDirectory: $routeParams.rootDirectory,
//   };
//   var progress = {
//     isProcessing: $scope.isProcessing,
//     downloadedFiles: $scope.downloadedFiles,
//     totalFiles: $scope.totalFiles,
//   };
//   downGitService.downloadZippedFiles(parameter, progress, toastr);
// } else if ($scope.url != "") {
//   toastr.warning("Invalid URL!", { iconClass: "toast-down" });
// }
