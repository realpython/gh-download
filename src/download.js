/**
 * Function to download GitHub repositories, GitHub repository sub folders, and raw files.
 *
 * The main data structure is the `folderStructure` which is an object that
 * represents a folder. The keys are the file or folder names and the values are
 * `ArrayBuffer` instances or another `folderStructure`, respectively.
 *
 * ```
 * {
 *    "my_file.txt" : ArrayBuffer().
 *    "folder" : {
 *        "another_file.txt": ArrayBuffer()
 *    }
 * }
 * ```
 *
 * The information is fetched while building a `folderStructure`. After that has
 * finished, it is then converted into a Zip archive.
 *
 * WARNING: If downloading a deeply nested folder, that is, with lots of
 * folders, you may run into the free API limit. Can't find the documented free
 * limit, but I heard it's 60 per hour.
 *
 */

import { MaterialsQuery } from "./query.js";

class GitHubObject {
  constructor(name, type, contents) {
    this.name = name;
    this.type = type;
    this.contents = contents;

    if (this.type === "file" && !this.contents instanceof ArrayBuffer) {
      throw "file contents must be ArrayBuffer";
    } else if (this.type === "dir" && !this.contents instanceof Array) {
      throw "dir contents must be Array";
    }
  }
}

export class GitHubFolder {
  #struct;
  /** @private */
  constructor(structure) {
    this.#struct = structure;
  }

  static async get(url) {
    const folder = new GitHubFolder(
      await GitHubFolder.getFolderStructure({ url })
    );
    console.log(folder);
    const zip = await folder.#buildZip(folder.#struct);
    console.log(zip);
    const blob = await zip.generateAsync({ type: "blob" });
    console.log(blob);
    saveAs(blob, MaterialsQuery.getSubDirName(url) + ".zip");
  }

  /**
   * Get an array buffer from a raw source.
   * @param {string} url
   * @returns {ArrayBuffer}
   */
  static async getFileData(url) {
    const arrayBuffer = await fetch(url).then((r) => r.arrayBuffer());
    return arrayBuffer;
  }

  static async getFolderStructure({ url = null, name = null } = {}) {
    const dir = new GitHubObject(
      name || MaterialsQuery.getSubDirName(url),
      "dir",
      await fetch(url).then((r) => r.json())
    );

    await Promise.all(
      dir.contents.map(async (item) => {
        if (item.type === "dir") {
          return await GitHubFolder.getFolderStructure({
            url: item.url,
            name: item.name,
          });
        } else if (item.type === "file") {
          return new GitHubObject(
            item.name,
            "file",
            await GitHubFolder.getFileData(item.download_url)
          );
        }
      })
    );
  }

  /**
   * Recursively builds a `JSZip` instance.
   * @param {object} folderStructure
   * @param {JSZip} zip
   * @returns {JSZip}
   */
  #buildZip() {
    function helper(folderStructure, zip = null) {
      if (zip === null) zip = new JSZip();

      Object.entries(folderStructure).forEach(([key, value]) => {
        console.log(key, value);
        if (value instanceof ArrayBuffer) {
          zip.file(key, value);
        } else {
          zip.folder(key);
          helper(value, zip.folder(key));
        }
      });
      return zip;
    }

    return helper(this.#struct);
  }
}

/**
 * Open a link in an invisible IFrame to download it.
 * Only works for GitHub ZIP archives.
 * @param {string} url
 */
export function downloadUrlWithIFrame(url) {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.display = "none";
  document.body.appendChild(iframe);
}

/**
 * Downloads a file from a url saving it as the last element of the main URL
 * https://github.com/.../[FILE_NAME]
 * Does not work for GitHub ZIP archives see {@link downloadUrlWithIFrame}
 * @param {string} url
 */
export function downloadFileFromUrl(url) {
  saveAs(url, MaterialsQuery.getFileNameFromUrl(url));
}
