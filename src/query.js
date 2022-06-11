/**
 * Final Url Form to start download
 *
 * https://api.github.com/repos/realpython/materials/contents/arcade-platformer?ref=master
 *
 * unless ZIP or FILE
 */

const VALID_HOSTS = ["github.com"];

export const QUERY_TYPES = {
  // https://github.com/rahmonov/alcazar
  REPO: "REPO",

  // https://github.com/realpython/materials/tree/master/python-yaml
  // https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4
  SUBDIR: "SUBDIR",

  // https://github.com/realpython/dockerizing-django/archive/master.zip
  ZIP: "ZIP",

  // https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py
  // TODO Also with arbitrary branch
  FILE: "FILE",

  // generator
  // dwitter
  WORD: "WORD",
};

const GITHUB_API_ENDPOINT = "https://api.github.com/repos";
/** The user/repo address of the repository on GitHub*/
const RP_MATERIALS_REPO = "realpython/materials";
const BRANCH = "master";

export function getQuery() {
  return window.location.search.slice(1);
}

export class UnsupportedHost extends Error {
  constructor(...params) {
    super("URL must be Github", ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsupportedHost);
    }

    this.name = "UnsupportedHost";
  }
}

export function classifyQuery(decodedQuery) {
  try {
    const url = new URL(decodedQuery);

    if (!VALID_HOSTS.includes(url.hostname)) throw new UnsupportedHost();

    const path = url.pathname.split("/").slice(1);

    if (path.length === 2) {
      return QUERY_TYPES.REPO;
    } else if (path.slice(-1)[0].match(".zip")) {
      return QUERY_TYPES.ZIP;
    } else if (path[2] === "tree") {
      return QUERY_TYPES.SUBDIR;
    } else if (path[2] === "blob") {
      return QUERY_TYPES.FILE;
    }
  } catch (e) {
    if (e instanceof UnsupportedHost) throw e;
    if (e instanceof TypeError) {
      return QUERY_TYPES.WORD;
    }
  }
}

export function buildFileUrl(classifiedQuery) {
  // https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py
  // https://raw.githubusercontent.com/realpython/materials/master/python-eval-mathrepl/mathrepl.py

  const url = new URL(decodedQuery);
  const path = url.pathname.split("/").slice(1);
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
