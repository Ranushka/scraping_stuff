'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../../lib');
const siteName = "justkidding";

lib.start(siteName, getProductLinks);

async function getProductLinks(gotoUrl) {

  await nightmare.goto(gotoUrl);

  var haveMore = true;

  //
  // ─── GO WHILE SCRAPING COMPLEAT THE PAGINATION ON THE LINK A LINK ───────────────
  //
  while (haveMore) {

    var url = await nightmare.url();
    console.log(url);

    await nightmare
      .wait(4000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.products-grid .item'),
          pagination = document.getElementsByClassName('i-next') > 0,
          brand = document.getElementsByClassName('block-title')[0].innerText;

        // going through each product
        productList.forEach(function (item) {
          links.push({
            "name": item.getElementsByClassName('product-name')[0].innerText,
            "url": item.getElementsByClassName('product-name')[0].href,
            "price": item.readAttribute('data-v'),
            "brand": brand,
            "site": "justkidding",
          });
        });

        /** click to naviagte in paginatin */
        return {
          'links': links,
          'pagination': pagination
        };

      }).then(function (resalt) {
        haveMore = resalt.pagination;
        lib.PrepToSave(resalt.links, `${lib.APIbaseUrl}/api/products`);
      })

    if (haveMore) {
      console.log('haveMore');
      /** click to naviagte in paginatin */
      await nightmare
        .evaluate(function () {
          document.getElementsByClassName('i-next')[0].click()
        })
    }
  }
}
