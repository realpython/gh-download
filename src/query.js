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

  // https://github.com/[USER]/[REPO]/tree/[SHA_OR_BRANCH]/[OPTIONAL_PATH_TO_SUBDIR]
  // SUBDIR can also be the root folder but at a branch or commit other than master/main
  SUBDIR: "SUBDIR",

  // https://github.com/[USER]/[REPO]/archive/master.zip
  // TODO - check this for "main"
  ZIP: "ZIP",

  // https://github.com/[USER]/[REPO]/blob/[SHA_OR_BRANCH]/[PATH_TO_FILE]
  FILE: "FILE",

  // [FOLDER_IN_MATERIALS_REPO]
  WORD: "WORD",
};

const GITHUB_API_ENDPOINT = "https://api.github.com/repos";
const GITHUB_RAW_ENDPOINT = "https://raw.githubusercontent.com";
/** The user/repo address of the repository on GitHub*/
const RP_MATERIALS_REPO = "realpython/materials";

export function getQuery() {
  return decodeURIComponent(window.location.search.slice(1));
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

/**
 * Converts main GitHub repository URL to direct link to ZIP archive of master branch
 * Basically adds "/archive/master.zip" to the end.
 * @param {string} classifiedQuery
 * @returns {string} direct download URL
 */
export function buildZipURLFromRepoURL(classifiedQuery) {
  return classifiedQuery + "/archive/master.zip";
}

/**
 * Converts URL's from this format:
 *
 * ```url
 * https://github.com/[USER]/[REPO]/blob/[SHA_OR_BRANCH]/[PATH_TO_FILE]
 * ```
 *
 * to this format:
 *
 * ```url
 * https://raw.githubusercontent.com/[USER]/[REPO]/[SHA_OR_BRANCH]/[PATH_TO_FILE]
 * ```
 *
 * `[PATH]` is optional
 *
 * @param {string} classifiedQuery
 * @returns {string} Raw URL to download file directly
 */
export function buildFileURL(classifiedQuery) {
  const url = new URL(classifiedQuery);
  const [user, repo, _, commit, ...path] = url.pathname.split("/").slice(1);

  return `${GITHUB_RAW_ENDPOINT}/${user}/${repo}/${commit}/${path.join("/")}`;
}

/**
 * Converts URL's from this format:
 *
 * ```url
 * https://github.com/[USER]/[REPO]/tree/[BRANCH_OR_SHA]/[PATH]
 * ```
 *
 * to this format:
 *
 * ```url
 * https://api.github.com/repos/[USER]/[REPO]/contents/[PATH]?ref=[BRANCH_OR_SHA]
 * ```
 *
 * `[PATH]` is optional
 *
 * @param {string} classifiedQuery
 * @returns {string} API URL to retrieve top level contents of files and folders at [PATH]
 */
export function buildSubDirURL(classifiedQuery) {
  const url = new URL(classifiedQuery);
  const [user, repo, _, commit, ...path] = url.pathname.split("/").slice(1);
  return (
    `${GITHUB_API_ENDPOINT}/` +
    `${user}/${repo}/contents/${path.join("/")}?ref=${commit}`
  );
}

/**
 * Gets a name for a subdir URL, e.g. for saving the archive
 *
 * @param {string} subDirUrl
 * @returns
 */
export function getSubDirName(subDirUrl) {
  const url = new URL(subDirUrl);
  const [_, user, repo, __, ...path] = url.pathname.split("/").slice(1);

  return `${repo}-${path.join("-")}`;
}

/**
 * Create Real Python API URL from [WORD]
 *
 * From:
 *
 * ```
 * [WORD]
 * ```
 *
 * To:
 *
 * ```
 * https://api.github.com/repos/realpython/materials/contents/[WORD]?ref=master
 * ```
 *
 * @param {string} folderName
 * @returns {string} API URL to retrieve top level contents of files and folders at the [WORD] folder
 */
export function createApiUrlFromWord(folderName) {
  return `${GITHUB_API_ENDPOINT}/${RP_MATERIALS_REPO}/contents/${folderName}?ref=master`;
}

export function getFileNameFromUrl(fileUrl) {
  const url = new URL(fileUrl);
  const [user, repo, _, commit, ...path] = url.pathname.split("/").slice(1);
  return path.slice(-1);
}
