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
import { errorFromResponse } from "./error.js";

/**
 * `fetch` that throws an `ERROR_TYPE` error on non-2xx responses, so a 404 or
 * rate-limit page never ends up saved as file contents.
 * @async
 * @param {string} url
 * @returns {Promise<Response>}
 */
async function fetchOk(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw await errorFromResponse(resp);
  return resp;
}

/**
 * Get an array buffer from a raw source.
 * @async
 * @param {string} url
 * @returns {Promise<ArrayBuffer>}
 */
export async function getFileData(url) {
  return (await fetchOk(url)).arrayBuffer();
}

/**
 * Downloads a file from a url saving it as the last element of the main URL
 * https://github.com/.../[FILE_NAME]
 * Does not work for GitHub ZIP archive URLs
 * @param {string} url
 */
export async function downloadFileFromUrl(url) {
  const blob = await (await fetchOk(url)).blob();
  saveAs(blob, MaterialsQuery.fileNameFromUrl(url));
}

export async function getContents(url) {
  return (await fetchOk(url)).json();
}

/**
 * Recursively build a `folderStructure` by making requests to the GitHub API
 * for folder contents, and making requests to the `raw` endpoints for files.
 * @async
 * @param {string} url
 * @returns {Promise<object>} a `folderStructure`
 */
async function getFolderStructure(url) {
  const structure = {};
  const json = await getContents(url);
  if (!Array.isArray(json)) throw new Error(`Not a directory: ${url}`);

  await Promise.all(
    json.map(async (item) => {
      if (item.type === "dir") {
        structure[item.name] = await getFolderStructure(item.url);
      } else if (item.type === "file") {
        structure[item.name] = await getFileData(item.download_url);
      }
    })
  );

  return structure;
}

/**
 * Recursively builds a `JSZip` instance from a `folderStructure`.
 * @param {object} folderStructure
 * @param {JSZip} zip
 * @returns {JSZip}
 */
function buildZipFromFolderStructure(folderStructure, zip = new JSZip()) {
  Object.entries(folderStructure).forEach(([key, value]) => {
    if (value instanceof ArrayBuffer) {
      zip.file(key, value);
    } else {
      buildZipFromFolderStructure(value, zip.folder(key));
    }
  });

  return zip;
}

/**
 * Must be github API url
 * @param {string} url
 */
export async function downloadSubDirFromGitHub(url) {
  const content = await buildZipFromFolderStructure(
    await getFolderStructure(url)
  ).generateAsync({ type: "blob" });
  saveAs(content, MaterialsQuery.subDirNameFromSubDirUrl(url) + ".zip");
}

/**
 * Navigate to a URL that GitHub serves as an attachment, which downloads it
 * without leaving the page. Only works for GitHub ZIP archives.
 * @param {string} url
 */
export function downloadUrlDirectly(url) {
  window.location.assign(url);
}
