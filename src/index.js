import { MaterialsQuery } from "./query.js";
import { applyBrand, brandForUrl } from "./brands.js";

import { hydrateDownloadButton, hydrateSourceCodeButton } from "./buttons.js";
import { errorScreen } from "./errorScreen.js";
import { ERROR_TYPE } from "./error.js";

const brand = brandForUrl(
  new URLSearchParams(window.location.search).get("url")
);

function handleError(e) {
  if (e.message == ERROR_TYPE.NOT_FOUND) {
    hydrateSourceCodeButton(brand.materialsUrl);
    errorScreen(ERROR_TYPE.NOT_FOUND);
  } else if (e.message == ERROR_TYPE.API_LIMIT) {
    errorScreen(ERROR_TYPE.API_LIMIT);
  } else {
    console.error(e);
    errorScreen();
  }
}

window.onload = async () => {
  applyBrand(document, brand);

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
