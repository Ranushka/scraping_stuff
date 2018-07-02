'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const lib = require('../../lib');
const siteName = "gap";

lib.start(siteName, getProductLinks);

async function getProductLinks(gotoUrl) {
  let haveMore = true,
  page = 0;

  //
  // ─── PREPARING THE SITE FOR SCRAPING ────────────────────────────────────────────
  //
  await nightmare
    .goto(`https://www.gap.ae/`)
    .wait(4000)
    .evaluate(function () {
      document.cookie = "prod___delivery_type_changed=true";
    });

  //
  // ─── GO WHILE SCRAPING COMPLEAT THE PAGINATION ON THE LINK A LINK ───────────────
  //
  while (haveMore) {

    //
    // ─── GOT TO SCRAPING URL ─────────────────────────────────────────
    //
    await nightmare
      .goto(`${gotoUrl}?p=${page++}`);

    //
    // ─── NOW SCRAPING ────────────────────────────────────────────────
    //
    var url = await nightmare.url();
    console.log(url);

    await nightmare
      .wait(4000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.product-item'),
          pagination = document.querySelectorAll('.load-more').length > 0;

        //
        // GOING THROUGH EACH PRODUCT
        //
        productList.forEach(function (item) {
          var data = JSON.parse(URI.decode(item.getAttribute('data-gtm-product')));
          links.push({
            "name": data.name,
            "url": item.href,
            "price": data.price,
            "brand": data.dimension6,
            "site": "gap",
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
        lib.PrepToSave(resalt.links, `${lib.APIbaseUrl}/api/products`);
      })
  }
}
