import { downloadFileFromUrl, downloadSubDirFromGitHub } from "./download.js";

const GITHUB_API_ENDPOINT = "https://api.github.com/repos";
const GITHUB_RAW_ENDPOINT = "https://raw.githubusercontent.com";
const VALID_HOSTS = ["github.com"];

export const QUERY_TYPES = {
  SUBDIR: "SUBDIR",
  FILE: "FILE",
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
  constructor() {
    this.params = new URLSearchParams(window.location.search);
    const firstParam = this.params.entries().next().value;
    if (firstParam == undefined || firstParam[1] == "" || firstParam[2] == "") {
      throw new Error("Invalid query, no key-value pair");
    }
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
  constructor() {
    super();
    try {
      this.materialUrl = new URL(this.params.get("url"));
    } catch (e) {
      throw new Error("Invalid URL");
    }

    this.path = this.materialUrl.pathname.split("/").slice(1);
    this.type = MaterialsQuery.#classifyQuery(
      this.materialUrl.hostname,
      this.path
    );
    this.#buildDownloadCallback();
  }

  static #classifyQuery(hostname, path) {
    if (!VALID_HOSTS.includes(hostname)) throw new UnsupportedHost();
    if (path.slice(-1)[0].match(".zip")) throw new Error("Can't be a zip file");
    if (path.length === 2) throw new Error("Can't be a base repository");

    if (path[2] === "tree") {
      return QUERY_TYPES.SUBDIR;
    } else if (path[2] === "blob") {
      return QUERY_TYPES.FILE;
    } else {
      throw new Error("Can't classify this URL");
    }
  }

  #buildDownloadCallback() {
    switch (this.type) {
      case QUERY_TYPES.SUBDIR:
        this.downloadCallback = async () =>
          await downloadSubDirFromGitHub(
            MaterialsQuery.apiUrlFromSubDirUrl(this.materialUrl)
          );
        break;
      case QUERY_TYPES.FILE:
        this.downloadCallback = () =>
          downloadFileFromUrl(
            MaterialsQuery.apiUrlFromFileUrl(this.materialUrl)
          );
        break;
      default:
        throw new Error("Not recognized type");
    }
    this.sourceCodeLink = this.materialUrl;
  }

  async download() {
    console.log("Downloading");
    await this.downloadCallback();
    return [this.downloadCallback, this.sourceCodeLink];
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
   * @param {string} apiUrl
   * @returns {string} Raw URL to download file directly
   */
  static apiUrlFromFileUrl(apiUrl) {
    const url = new URL(apiUrl);
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
   * @param {string} apiUrl
   * @returns {string} API URL to retrieve top level contents of files and folders at [PATH]
   */
  static apiUrlFromSubDirUrl(apiUrl) {
    const url = new URL(apiUrl);
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
  static subDirNameFromSubDirUrl(subDirUrl) {
    const url = new URL(subDirUrl);
    const [_, user, repo, __, ...path] = url.pathname.split("/").slice(1);
    if (path.length !== 0) {
      return `${repo}-${path.join("-")}`;
    } else return repo;
  }

  static fileNameFromUrl(fileUrl) {
    const url = new URL(fileUrl);
    const [user, repo, _, commit, ...path] = url.pathname.split("/").slice(1);
    return path.slice(-1);
  }
}
