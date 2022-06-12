import {
  getQuery,
  classifyQuery,
  QUERY_TYPES,
  buildFileURL,
  buildZipURLFromRepoURL,
  buildSubDirURL,
  convertZipLinkToSourceCode,
  createSourceCodeUrlFromWord,
} from "./query.js";
import {
  downloadFileFromUrl,
  downloadUrlWithIFrame,
  downloadSubDirFromGitHub,
  downloadMaterialsFromWord,
} from "./download.js";
import { initializeButtons } from "./initializeButtons.js";
import { noQueryScreen } from "./noQueryScreen.js";

window.onload = async () => {
  try {
    const query = getQuery();

    if (query == "") {
      noQueryScreen();
      return;
    }

    const queryType = classifyQuery(query);
    let downloadCallback;
    let sourceCodeLink;

    switch (queryType) {
      case QUERY_TYPES.REPO:
        downloadCallback = () =>
          downloadUrlWithIFrame(buildZipURLFromRepoURL(query));
        sourceCodeLink = query;
        break;
      case QUERY_TYPES.SUBDIR:
        downloadCallback = async () =>
          await downloadSubDirFromGitHub(buildSubDirURL(query));
        sourceCodeLink = query;
        break;
      case QUERY_TYPES.ZIP:
        downloadCallback = () => downloadUrlWithIFrame(query);
        sourceCodeLink = convertZipLinkToSourceCode(query);
        break;
      case QUERY_TYPES.FILE:
        downloadCallback = () => downloadFileFromUrl(buildFileURL(query));
        sourceCodeLink = query;
        break;
      case QUERY_TYPES.WORD:
        downloadCallback = async () => await downloadMaterialsFromWord(query);
        sourceCodeLink = createSourceCodeUrlFromWord(query);
        break;
      default:
        noQueryScreen();
        return;
    }

    downloadCallback();

    initializeButtons(downloadCallback, sourceCodeLink);
  } catch (e) {
    console.log(e);
    noQueryScreen();
  }

  // if (targetFolder) {
  //   try {
  //     await downloadMaterials(targetFolder);
  //     // initializeButtons(targetFolder);
  //   } catch (e) {
  //     console.error(e);
  //     noQueryScreen();
  //   }
  // } else {
  //   noQueryScreen();
  // }
};
