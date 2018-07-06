'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const lib = require('../../lib');
const siteName = "noon";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {

  await nightmare.goto(urlToScrape);

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
          productList = document.querySelectorAll('.productContainer'),
          pagination = !document.querySelectorAll('.next.disabled').length > 0,
          brand = document.querySelectorAll('.breadcrumb a:last-child')[0].innerText.trim();

        // going through each product
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('.name')[0].innerText.trim(),
            "url": item.querySelectorAll('.product')[0].href,
            "price": item.querySelectorAll('.sellingPrice')[0].innerText.trim().replace('AED ', ''),
            "brand": brand,
            "site": "noon",
          });
        });

        // return all the values
        return {
          'links': links,
          'pagination': pagination
        };

      }).then(function (result) {
        haveMore = result.pagination;
        lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/createOrUpdate`, urlToScrape);
      })

    if (haveMore) {
      console.log('haveMore');
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('li.next a')[0].click();
        })
        .wait(3000);
    }
  }

  /** nightmare kill */
  await nightmare.end();
}
