import {
  downloadFileFromUrl,
  downloadSubDirFromGitHub,
  downloadUrlDirectly,
  getContents,
} from "./download.js";
import { ERROR_TYPE } from "./error.js";

const GITHUB_API_ENDPOINT = "https://api.github.com/repos";
const GITHUB_RAW_ENDPOINT = "https://raw.githubusercontent.com";
const GITHUB_ROOT = "https://github.com";
const VALID_HOSTS = ["github.com", "www.github.com"];
// href in link in index.html should be initialized to this
export const FALLBACK_URL = "https://github.com/realpython/materials";

export const QUERY_TYPES = {
  SUBDIR: "SUBDIR",
  FILE: "FILE",
  ZIP: "ZIP",
  BASE_REPO: "BASE_REPO",
};

/**
 * Path segments of a URL, ignoring empty ones from leading, trailing or
 * doubled slashes.
 * @param {string|URL} url
 * @returns {string[]}
 */
function pathSegments(url) {
  return new URL(url).pathname.split("/").filter(Boolean);
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

export class Query {
  constructor() {
    this.params = new URLSearchParams(window.location.search);
    const firstParam = this.params.entries().next().value;
    if (firstParam === undefined || firstParam[1] === "") {
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
      throw new Error(ERROR_TYPE.INVALID_URL);
    }

    this.path = pathSegments(this.materialUrl);
    this.type = MaterialsQuery.#classifyQuery(
      this.materialUrl.hostname,
      this.path
    );
    this.downloadCallback = this.getDownloadCallback();
  }

  static #classifyQuery(hostname, path) {
    if (!VALID_HOSTS.includes(hostname)) throw new UnsupportedHost();
    if (path.length < 2) throw new Error("Can't classify this URL");

    if (path[2] === "tree") {
      return QUERY_TYPES.SUBDIR;
    } else if (path[2] === "blob") {
      return QUERY_TYPES.FILE;
    } else if (path.at(-1).endsWith(".zip")) {
      return QUERY_TYPES.ZIP;
    } else if (path.length === 2) {
      return QUERY_TYPES.BASE_REPO;
    } else {
      throw new Error("Can't classify this URL");
    }
  }

  async getSourceCodeLink() {
    if (this.type === QUERY_TYPES.ZIP) {
      await getContents(MaterialsQuery.apiUrlFromZipUrl(this.materialUrl));
      return MaterialsQuery.srcUrlFromZipUrl(this.materialUrl);
    } else if (this.type === QUERY_TYPES.BASE_REPO) {
      await getContents(MaterialsQuery.apiUrlFromRepoUrl(this.materialUrl));
      return MaterialsQuery.srcUrlFromZipUrl(this.materialUrl);
    } else {
      return this.materialUrl;
    }
  }

  getDownloadCallback() {
    switch (this.type) {
      case QUERY_TYPES.SUBDIR:
        return async () => {
          await downloadSubDirFromGitHub(
            MaterialsQuery.apiUrlFromSubDirUrl(this.materialUrl)
          );
        };

      case QUERY_TYPES.FILE:
        return async () => {
          await downloadFileFromUrl(
            MaterialsQuery.apiUrlFromFileUrl(this.materialUrl)
          );
        };

      case QUERY_TYPES.ZIP:
        return async () => downloadUrlDirectly(this.materialUrl.href);

      case QUERY_TYPES.BASE_REPO:
        return async () =>
          downloadUrlDirectly(
            MaterialsQuery.zipUrlFromRepoUrl(this.materialUrl)
          );

      default:
        throw new Error("Not downloadable type");
    }
  }

  async download() {
    await this.downloadCallback();
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
    const [user, repo, _, commit, ...path] = pathSegments(apiUrl);

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
    const [user, repo, _, commit, ...path] = pathSegments(apiUrl);
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
    const [_, user, repo, __, ...path] = pathSegments(subDirUrl).map(
      decodeURIComponent
    );
    return [repo, ...path].join("-");
  }

  static fileNameFromUrl(fileUrl) {
    return decodeURIComponent(pathSegments(fileUrl).at(-1));
  }

  static srcUrlFromZipUrl(zipUrl) {
    const [user, repo] = pathSegments(zipUrl);
    return `${GITHUB_ROOT}/${user}/${repo}`;
  }

  static apiUrlFromZipUrl(zipUrl) {
    return MaterialsQuery.apiUrlFromRepoUrl(zipUrl);
  }

  /**
   * API URL for the repository itself, which exists regardless of the name of
   * the default branch.
   * @param {string} repoUrl
   * @returns {string}
   */
  static apiUrlFromRepoUrl(repoUrl) {
    const [user, repo] = pathSegments(repoUrl);
    return `${GITHUB_API_ENDPOINT}/${user}/${repo}`;
  }

  /**
   * Archive of the default branch, whether it's called `master` or `main`.
   * @param {string} repoUrl
   * @returns {string}
   */
  static zipUrlFromRepoUrl(repoUrl) {
    const [user, repo] = pathSegments(repoUrl);
    return `${GITHUB_ROOT}/${user}/${repo}/archive/HEAD.zip`;
  }
}
