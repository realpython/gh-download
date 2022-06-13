import {
  downloadFileFromUrl,
  downloadUrlWithIFrame,
  downloadSubDirFromGitHub,
  downloadMaterialsFromWord,
} from "./download.js";

export const RP_MATERIALS_REPO_PATH = "realpython/materials";
export const RP_HOME = "https://www.realpython.com";
const GITHUB_API_ENDPOINT = "https://api.github.com/repos";
const GITHUB_RAW_ENDPOINT = "https://raw.githubusercontent.com";
const VALID_HOSTS = ["github.com"];

export const QUERY_TYPES = {
  // https://github.com/[USER]/[REPO]
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

export class UnsupportedHost extends Error {
  constructor(...params) {
    super("URL must be Github", ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsupportedHost);
    }

    this.name = "UnsupportedHost";
  }
}

export class Query {
  constructor(text = null) {
    if (text === null) this.value = Query.getQuery();
    else if (text[0] === "?") this.value = text.slice(1);
    else this.value = text;

    if (this.value == "") throw "No Query";
  }

  static getQuery() {
    return decodeURIComponent(window.location.search.slice(1));
  }

  static #setURL(newURL) {
    if (window.location.href !== newURL) {
      window.location.replace(newURL);
    }
  }

  static setQuery(query) {
    if (
      window.location.href !==
      window.location.origin + window.location.pathname + "?" + query
    ) {
      Query.#setURL(
        window.location.origin + window.location.pathname + "?" + query
      );
    }
  }
}

export class MaterialsQuery extends Query {
  constructor(text = null) {
    super(text);
    this.type = MaterialsQuery.#classifyQuery(this.value);
    this.#buildDownloadCallback();
  }

  static #classifyQuery(query) {
    try {
      const url = new URL(query);

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
      throw e;
    }
  }

  #buildDownloadCallback() {
    switch (this.type) {
      case QUERY_TYPES.REPO:
        this.downloadCallback = () =>
          downloadUrlWithIFrame(
            MaterialsQuery.buildZipURLFromRepoURL(this.value)
          );
        this.sourceCodeLink = this.value;
        break;
      case QUERY_TYPES.SUBDIR:
        this.downloadCallback = async () =>
          await downloadSubDirFromGitHub(
            MaterialsQuery.buildSubDirURL(this.value)
          );
        this.sourceCodeLink = this.value;
        break;
      case QUERY_TYPES.ZIP:
        this.downloadCallback = () => downloadUrlWithIFrame(this.value);
        this.sourceCodeLink = MaterialsQuery.convertZipLinkToSourceCode(
          this.value
        );
        break;
      case QUERY_TYPES.FILE:
        this.downloadCallback = () =>
          downloadFileFromUrl(MaterialsQuery.buildFileURL(this.value));
        this.sourceCodeLink = this.value;
        break;
      case QUERY_TYPES.WORD:
        this.downloadCallback = async () =>
          await downloadMaterialsFromWord(this.value);
        this.sourceCodeLink = MaterialsQuery.createSourceCodeUrlFromWord(
          this.value
        );
        break;
      default:
        throw "Not recognized type";
    }
  }

  download() {
    this.downloadCallback();
    return [this.downloadCallback, this.sourceCodeLink];
  }

  /**
   * Converts main GitHub repository URL to direct link to ZIP archive of master branch
   * Basically adds "/archive/master.zip" to the end.
   * @param {string} classifiedQuery
   * @returns {string} direct download URL
   */
  static buildZipURLFromRepoURL(classifiedQuery) {
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
  static buildFileURL(classifiedQuery) {
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
  static buildSubDirURL(classifiedQuery) {
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
  static getSubDirName(subDirUrl) {
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
  static createApiUrlFromWord(folderName) {
    return `${GITHUB_API_ENDPOINT}/${RP_MATERIALS_REPO_PATH}/contents/${folderName}?ref=master`;
  }

  static createSourceCodeUrlFromWord(word) {
    return `https://github.com/${RP_MATERIALS_REPO_PATH}/${word}`;
  }

  static getFileNameFromUrl(fileUrl) {
    const url = new URL(fileUrl);
    const [user, repo, _, commit, ...path] = url.pathname.split("/").slice(1);
    return path.slice(-1);
  }

  /**
   * https://github.com/[USER]/[REPO]/archive/master.zip
   * to
   * https://github.com/[USER]/[REPO]
   *
   * @param {string} zipUrl
   * @returns {string}
   */
  static convertZipLinkToSourceCode(zipUrl) {
    const url = new URL(zipUrl);
    const [user, repo, ...rest] = url.pathname.split("/").slice(1);
    return `https://github.com/${user}/${repo}`;
  }
}
