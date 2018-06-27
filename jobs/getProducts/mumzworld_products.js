'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../../lib');
const siteName = "mumzworld";

lib.start(siteName, getProductLinks);

async function getProductLinks(gotoUrl) {

  await nightmare.goto(gotoUrl);

  var haveMore = true;

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
      .evaluate(function (siteName, result) {

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
            "site": siteName,
          });
        });

        //
        // RETURN ALL THE VALUES
        //
        return {
          'links': links,
          'pagination': pagination
        };

      }).then(function (resalt) {
        haveMore = resalt.pagination;
        lib.PrepToSave(resalt.links);
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
}
