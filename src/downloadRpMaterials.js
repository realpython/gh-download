/**
 * Download a folder from the Real Python materials repository
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

const GITHUB_API_ENDPOINT = "https://api.github.com/repos";
/** The user/repo address of the repository on GitHub*/
const RP_MATERIALS_REPO = "realpython/materials";
const BRANCH = "master";

/**
 * Create the initial query URL.
 * @param {string} folderName
 * @returns {string} A url e.g. https://api.github.com/repos/realpython/materials/contents/dwitter-part-1?ref=master
 */
function createURL(folderName) {
  return `${GITHUB_API_ENDPOINT}/${RP_MATERIALS_REPO}/contents/${folderName}?ref=${BRANCH}`;
}

/**
 * Get an array buffer from a raw source.
 * @param {string} url
 * @returns {ArrayBuffer}
 */
async function getFileData(url) {
  const arrayBuffer = await fetch(url).then((r) => r.arrayBuffer());
  return arrayBuffer;
}

/**
 * Recursively build a `folderStructure` by making requests to the GitHub API
 * for folder contents, and making requests to the `raw` endpoints for files.
 * @param {string} url
 * @param {object} structure
 * @returns {object} a `folderStructure`
 */
async function getFolderStructure(url, structure = null) {
  if (structure === null) structure = {};

  const resp = await fetch(url).then((r) => r.json());

  await Promise.all(
    resp.map(async (item) => {
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
      zip.file(key, value, (createFolders = false));
    } else {
      zip.folder(key);
      buildZipFromFolderStructure(value, zip.folder(key));
    }
  });

  return zip;
}

/**
 * Fetch folder from repository, build a ZIP archive and download it.
 * @param {string} folderName
 */
export async function downloadMaterials(folderName) {
  const url = createURL(folderName);

  const resp = await getFolderStructure(url);
  buildZipFromFolderStructure(resp)
    .generateAsync({ type: "blob" })
    .then(function (content) {
      saveAs(content, folderName + ".zip");
    });
}
