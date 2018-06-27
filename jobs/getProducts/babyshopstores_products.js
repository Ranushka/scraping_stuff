'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../../lib');
const siteName = "babyshopstores";

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
      .wait(4000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.product-item'),
          pagination = document.querySelectorAll('[class="next"]').length ? true : false,
          tagsElemnts = document.querySelectorAll('.breadcrumb > li > a'),
          tags = [];

        //
        // GET TAGS FOR THE PRODUCT
        //
        tagsElemnts.forEach(function (a) {
          tags.push(a.innerText)
        });

        //
        // GOING THROUGH EACH PRODUCT
        //
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('[itemprop="name"]')[0].innerText.trim(),
            "url": item.querySelectorAll(".product-link")[0].href,
            "price": item.querySelectorAll('[itemprop="price"]')[0].innerText.trim(),
            "brand": tags,
            "site": "babyshopstores",
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
      await nightmare
        .click('.next')
        .wait(2000)
    }
  }
}
