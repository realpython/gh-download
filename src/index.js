import {
  getQuery,
  classifyQuery,
  QUERY_TYPES,
  buildFileURL,
  buildZipURLFromRepoURL,
  buildSubDirURL,
} from "./query.js";
import {
  downloadFileFromUrl,
  downloadUrlWithIFrame,
  downloadSubDirFromGitHub,
  downloadMaterialsFromWord,
} from "./download.js";
// import { initializeButtons } from "./initializeButtons.js";
import { noQueryScreen } from "./noQueryScreen.js";

window.onload = async () => {
  try {
    const query = getQuery();

    if (query == "") {
      noQueryScreen();
      return;
    }

    const queryType = classifyQuery(query);

    switch (queryType) {
      case QUERY_TYPES.REPO:
        downloadUrlWithIFrame(buildZipURLFromRepoURL(query));
        break;
      case QUERY_TYPES.SUBDIR:
        await downloadSubDirFromGitHub(buildSubDirURL(query));
        break;
      case QUERY_TYPES.ZIP:
        downloadUrlWithIFrame(query);
        break;
      case QUERY_TYPES.FILE:
        downloadFileFromUrl(buildFileURL(query));
        break;
      case QUERY_TYPES.WORD:
        await downloadMaterialsFromWord(query);
        break;
      default:
        noQueryScreen();
        return;
    }

    initializeButtons("?");
  } catch (e) {
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
