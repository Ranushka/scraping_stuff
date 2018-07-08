'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "mumzworld";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare();

  await nightmare.goto(urlToScrape);

  //
  // ─── GO WHILE SCRAPING COMPLEAT THE PAGINATION ON THE LINK A LINK ───────────────
  //
  while (haveMore) {

    //
    // ─── NOW SCRAPING SITE URL ────────────────────────────────────
    //
    var url = await nightmare.url();
    console.log(url);

    await nightmare
      .wait(3000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.products-grid a.product-image'),
          pagination = document.querySelectorAll('.toolbar .sprite_img.next.i-next').length > 0;

        //
        // GOING THROUGH EACH PRODUCT
        //
        productList.forEach(function (item) {
          links.push({
            "name": item.title,
            "url": item.href,
            "price": item.dataset.pprice,
            "brand": item.dataset.pbrand,
            "site": 'mumzworld',
          });
        });

        //
        // RETURN ALL THE VALUES
        //
        return {
          'links': links,
          'pagination': pagination
        };

      }).then(function (result) {
        haveMore = result.pagination;
        lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/createOrUpdate`, urlToScrape);
      })

    //
    // ─── CHECK HAVE MORE TO THE PAGE ─────────────────────────────────
    //
    if (haveMore) {
      console.log('haveMore');
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('.toolbar .sprite_img.next.i-next')[0].click();
        })
        .wait(3000);
    }
  }

  /** nightmare kill */
  await nightmare.end();
}
