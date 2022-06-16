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

/**
 * Get an array buffer from a raw source.
 * @async
 * @param {string} url
 * @returns {Promise<ArrayBuffer>}
 */
async function getFileData(url) {
  const arrayBuffer = await fetch(url).then((r) => r.arrayBuffer());
  return arrayBuffer;
}

/**
 * Downloads a file from a url saving it as the last element of the main URL
 * https://github.com/.../[FILE_NAME]
 * Does not work for GitHub ZIP archive URLs
 * @param {string} url
 */
export function downloadFileFromUrl(url) {
  saveAs(url, MaterialsQuery.fileNameFromUrl(url));
}

/**
 * Recursively build a `folderStructure` by making requests to the GitHub API
 * for folder contents, and making requests to the `raw` endpoints for files.
 * @async
 * @param {string} url
 * @param {object} structure
 * @returns {Promise<object>} a `folderStructure`
 */
async function getFolderStructure(url, structure = null) {
  if (structure === null) structure = {};

  const resp = await fetch(url);
  const json = await resp.json();
  if (resp.ok === false) {
    if (json.message.includes("API rate limit exceeded")) {
      throw new Error(ERROR_TYPE.API_LIMIT);
    } else if (resp.status == 404) {
      throw new Error(ERROR_TYPE.NOT_FOUND);
    } else {
      throw new Error();
    }
  }

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
function buildZipFromFolderStructure(folderStructure, zip = null) {
  if (zip === null) zip = new JSZip();

  Object.entries(folderStructure).forEach(([key, value]) => {
    if (value instanceof ArrayBuffer) {
      zip.file(key, value);
    } else {
      zip.folder(key);
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
  buildZipFromFolderStructure(await getFolderStructure(url))
    .generateAsync({ type: "blob" })
    .then(function (content) {
      saveAs(content, MaterialsQuery.subDirNameFromSubDirUrl(url) + ".zip");
    });
}
