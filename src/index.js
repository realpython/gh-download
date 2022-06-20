import { MaterialsQuery } from "./query.js";

import { hydrateDownloadButton, hydrateSourceCodeButton } from "./buttons.js";
import { errorScreen } from "./errorScreen.js";
import { ERROR_TYPE } from "./error.js";

const MATERIALS_REPO = "https://github.com/realpython/materials";

window.onload = async () => {
  try {
    const materialsQuery = new MaterialsQuery();
    const srcCodeLink = materialsQuery.getSourceCodeLink() || MATERIALS_REPO;
    hydrateSourceCodeButton(srcCodeLink);
    if (materialsQuery.downloadCallback) {
      hydrateDownloadButton(materialsQuery.downloadCallback);
      await materialsQuery.download();
    } else {
      throw new Error("Not downloadable");
    }
  } catch (e) {
    hydrateSourceCodeButton(MATERIALS_REPO);
    if (e.message == ERROR_TYPE.API_LIMIT) {
      errorScreen(ERROR_TYPE.API_LIMIT);
    } else if (e.message == ERROR_TYPE.NOT_FOUND) {
      errorScreen(ERROR_TYPE.NOT_FOUND);
      hydrateSourceCodeButton(MATERIALS_REPO, true);
    } else {
      console.log(e);
      errorScreen();
    }
  }
};
