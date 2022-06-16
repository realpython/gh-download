import { MaterialsQuery } from "./query.js";

import { initializeButtons } from "./initializeButtons.js";
import {
  noQueryScreen,
  softHideClass,
  softRevealClass,
} from "./noQueryScreen.js";
import { ERROR_TYPE } from "./error.js";
import { createSpinner } from "./spinner.js";

window.onload = async () => {
  const spinner = createSpinner();
  softHideClass(".error-hide");
  try {
    document
      .querySelector(".title-container")
      .insertAdjacentElement("afterend", spinner);
    const materialsQuery = new MaterialsQuery();
    const [downloadCallback, sourceCodeLink] = await materialsQuery.download();
    spinner.remove();
    softRevealClass(".error-hide");
    initializeButtons(downloadCallback, sourceCodeLink);
  } catch (e) {
    if (e.message == ERROR_TYPE.API_LIMIT) {
      noQueryScreen(ERROR_TYPE.API_LIMIT);
    } else if (e.message == ERROR_TYPE.NOT_FOUND) {
      noQueryScreen(ERROR_TYPE.NOT_FOUND);
    } else {
      console.log(e);
      noQueryScreen();
    }
  } finally {
    spinner.remove();
  }
};
