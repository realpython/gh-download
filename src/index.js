import { MaterialsQuery, FALLBACK_URL } from "./query.js";

import { hydrateDownloadButton, hydrateSourceCodeButton } from "./buttons.js";
import { errorScreen } from "./errorScreen.js";
import { ERROR_TYPE } from "./error.js";

window.onload = async () => {
  try {
    const materialsQuery = new MaterialsQuery();
    const srcCodeLink = materialsQuery.getSourceCodeLink();
    hydrateSourceCodeButton(srcCodeLink);
    hydrateDownloadButton(materialsQuery.downloadCallback);
    await materialsQuery.download();
  } catch (e) {
    if (e.message == ERROR_TYPE.API_LIMIT) {
      errorScreen(ERROR_TYPE.API_LIMIT);
    } else if (e.message == ERROR_TYPE.NOT_FOUND) {
      errorScreen(ERROR_TYPE.NOT_FOUND);
      hydrateSourceCodeButton(FALLBACK_URL);
    } else {
      console.log(e);
      errorScreen();
    }
  }
};
