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
      const path = url.pathname.split("/").slice(1);

      if (!VALID_HOSTS.includes(url.hostname)) throw new UnsupportedHost();
      if (path.slice(-1)[0].match(".zip"))
        throw new Error("Can't be a zip file");
      if (path.length === 2) throw new Error("Can't be a base repository");

      if (path[2] === "tree") {
        return QUERY_TYPES.SUBDIR;
      } else if (path[2] === "blob") {
        return QUERY_TYPES.FILE;
      } else {
        throw new Error("Can't classify this URL");
      }
    } catch (e) {
      if (e instanceof UnsupportedHost) throw e;
      if (e instanceof TypeError) {
        throw new Error("Single words aren't valid queries");
      }
      throw e;
    }
  }

  #buildDownloadCallback() {
    switch (this.type) {
      case QUERY_TYPES.SUBDIR:
        this.downloadCallback = async () =>
          await downloadSubDirFromGitHub(
            MaterialsQuery.apiUrlFromSubDirUrl(this.value)
          );
        break;
      case QUERY_TYPES.FILE:
        this.downloadCallback = () =>
          downloadFileFromUrl(MaterialsQuery.apiUrlFromFileUrl(this.value));
        break;
      default:
        throw "Not recognized type";
    }
    this.sourceCodeLink = this.value;
  }

  async download() {
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
