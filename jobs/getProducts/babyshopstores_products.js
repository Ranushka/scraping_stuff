'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "babyshopstores";

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

      }).then(function (result) {
        haveMore = result.pagination;
        lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/createOrUpdate`, urlToScrape);
      })

    //
    // ─── CHECK HAVE MORE TO THE PAGE ─────────────────────────────────
    //  
    if (haveMore) {
      await nightmare
        .click('.next')
    }
  }
  
  /** nightmare kill */
  await nightmare.end();
}
