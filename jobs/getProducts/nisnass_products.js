'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../../lib');
const siteName = "nisnass";

lib.start(siteName, getProductLinks);

async function getProductLinks(gotoUrl) {

  await nightmare.goto(gotoUrl);

  //
  // ─── NOW SCRAPING SITE URL ────────────────────────────────────
  //
  var url = await nightmare.url();
  console.log(url);

  //
  // ─── SCROOL INFINITE SCROLL TO END ──────────────────────────────────────────────
  //
  var previousHeight, currentHeight = 0;
  while (previousHeight !== currentHeight) {
    previousHeight = currentHeight;
    var currentHeight = await nightmare.evaluate(function () {
      return document.body.scrollHeight;
    });
    await nightmare.scrollTo(currentHeight, 0)
      .wait(2000);
  }

  //
  // ─── START SCRAPING ─────────────────────────────────────────────────────────────
  //
  await nightmare
    .wait(3000)
    .evaluate(function () {

      var links = [],
        productList = document.querySelectorAll('.PLP-productList .Product');

      //
      // GOING THROUGH EACH PRODUCT
      //
      productList.forEach(function (item) {
        links.push({
          "name": item.getElementsByClassName("Product-name")[0].innerText.trim(),
          "url": item.getElementsByClassName("Product-details")[0].href,
          "price": item.getElementsByClassName("Product-minPrice")[0].innerText.replace(' AED', ''),
          "brand": item.getElementsByClassName("Product-brand")[0].innerText.trim(),
          "site": "nisnass",
        });
      });

      //
      // RETURN ALL THE VALUES
      //
      return {
        'links': links
      };

    }).then(function (resalt) {
      lib.PrepToSave(resalt.links);
    });
}
