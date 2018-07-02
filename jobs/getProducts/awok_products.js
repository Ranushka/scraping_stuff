'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const lib = require('../../lib');
const siteName = "awok";

lib.start(siteName, getProductLinks);

async function getProductLinks(gotoUrl) {

  await nightmare.goto(gotoUrl);

  var haveMore = true;

  //
  // ─── GO WHILE SCRAPING COMPLEAT THE PAGINATION ON THE LINK A LINK ───────────────
  //
  while (haveMore) {

    //
    // ─── LOGING SCRAPING SITE URL ────────────────────────────────────
    //
    var url = await nightmare.url();
    console.log(url);

    await nightmare
      .wait(3000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.productslist_item_link'),
          tags = document.querySelectorAll('.heading_section')[0].innerText.trim(),
          pagination = document.querySelectorAll('.modern-page-next').length > 0;

        //
        // GOING THROUGH EACH PRODUCT
        //
        productList.forEach(function (item) {
          links.push({
            "name": item.getElementsByClassName('productslist_item_title')[0].innerText.trim(),
            "url": item.href,
            "price": item.getElementsByClassName('productslist_item_pricenew')[0].innerText.replace(' AED', ''),
            "brand": tags,
            "site": "awok",
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

    //
    // ─── CHECK HAVE MORE TO THE PAGE ─────────────────────────────────
    //  
    if (haveMore) {
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('.modern-page-next')[0].click();
        })
        .wait(3000);
    }
  }
}
