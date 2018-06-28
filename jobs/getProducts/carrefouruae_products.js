'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const lib = require('../../lib');
const siteName = "carrefouruae";

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
          productList = document.querySelectorAll('.plp-list__item'),
          pagination = document.querySelectorAll('.plp-pagination__nav:last-child')[0].classList.length == 1,
          tags = document.querySelectorAll('.comp-breadcrumb__item:last-child')[0].innerText.trim();

        //
        // GOING THROUGH EACH PRODUCT
        //
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('.comp-productcard__img')[0].title.trim(),
            "url": item.querySelectorAll(".comp-productcard__wrap > a")[0].href,
            "price": item.querySelectorAll('.comp-productcard__price')[0].innerText.trim(),
            "brand": tags,
            "site": "carrefouruae",
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
        lib.PrepToSave(resalt.links, 'https://sitedata-mum.herokuapp.com/api/products');
      })

    //
    // ─── CHECK HAVE MORE TO THE PAGE ─────────────────────────────────
    //  
    if (haveMore) {
      var nextPageUrl = await nightmare
        .evaluate(function () {
          return document.querySelectorAll('.plp-pagination__nav:last-child a')[0].href
        })

      await nightmare
        .goto(nextPageUrl)
        .wait(3000);
    }
  }
}