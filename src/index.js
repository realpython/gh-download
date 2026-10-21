import { MaterialsQuery, FALLBACK_URL } from "./query.js";

import { hydrateDownloadButton, hydrateSourceCodeButton } from "./buttons.js";
import { errorScreen } from "./errorScreen.js";
import { ERROR_TYPE } from "./error.js";

function handleError(e) {
  if (e.message == ERROR_TYPE.NOT_FOUND) {
    hydrateSourceCodeButton(FALLBACK_URL);
    errorScreen(ERROR_TYPE.NOT_FOUND);
  } else if (e.message == ERROR_TYPE.API_LIMIT) {
    errorScreen(ERROR_TYPE.API_LIMIT);
  } else {
    console.error(e);
    errorScreen();
  }
}

window.onload = async () => {
  let materialsQuery;
  try {
    materialsQuery = new MaterialsQuery();
  } catch (e) {
    console.error(e);
    errorScreen(ERROR_TYPE.INVALID_URL);
    return;
  }

  hydrateDownloadButton(() => materialsQuery.download().catch(handleError));

  try {
    hydrateSourceCodeButton(await materialsQuery.getSourceCodeLink());
    await materialsQuery.download();
  } catch (e) {
    handleError(e);
  }
};
