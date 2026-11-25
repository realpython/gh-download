import { JSDOM } from "jsdom";
import assert from "assert";
import fs from "fs";

import { BRANDS, applyBrand, brandForUrl } from "../src/brands.js";

describe("Pick the brand from the materials URL", function () {
  it("should pick RealJS for the realjs account", function () {
    assert.equal(
      brandForUrl("https://github.com/realjs/materials/tree/main/closures"),
      BRANDS.realjs
    );
  });

  it("should ignore the account's letter case", function () {
    assert.equal(
      brandForUrl("https://github.com/RealJS/materials"),
      BRANDS.realjs
    );
  });

  it("should pick Real Python for the realpython account", function () {
    assert.equal(
      brandForUrl("https://github.com/realpython/materials/tree/master/x"),
      BRANDS.realpython
    );
  });

  it("should fall back to Real Python for other accounts", function () {
    assert.equal(
      brandForUrl("https://github.com/rahmonov/alcazar"),
      BRANDS.realpython
    );
  });

  it("should fall back to Real Python for a missing or bad URL", function () {
    assert.equal(brandForUrl(null), BRANDS.realpython);
    assert.equal(brandForUrl("not a url"), BRANDS.realpython);
  });
});

describe("Apply a brand to the page", function () {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url));

  it("should swap in RealJS's copy and links", function () {
    const doc = new JSDOM(html).window.document;
    applyBrand(doc, BRANDS.realjs);

    assert.equal(doc.documentElement.dataset.brand, "realjs");
    assert.equal(doc.title, "RealJS Materials Downloader");
    assert.equal(doc.getElementById("logo").getAttribute("src"),
      "assets/realjs/logo-light.svg");
    assert.equal(doc.getElementById("src-code").href,
      "https://github.com/realjs/materials");
    assert.equal(doc.getElementById("back-to-rp").href, "https://realjs.com/");
    assert.equal(doc.getElementById("support").href,
      "https://realjs.com/contact/");
    assert.match(doc.getElementById("tagline").textContent, /RealJS/);
    assert.equal(
      doc.querySelector('link[rel="icon"]').getAttribute("href"),
      "assets/realjs/favicon.png"
    );
  });

  it("should keep the page as it is for Real Python", function () {
    const doc = new JSDOM(html).window.document;
    applyBrand(doc, BRANDS.realpython);

    assert.equal(doc.title, "RP Materials Downloader");
    assert.equal(doc.getElementById("src-code").href,
      "https://github.com/realpython/materials");
    assert.equal(doc.getElementById("support").href,
      "https://support.realpython.com/contact/");
  });
});
