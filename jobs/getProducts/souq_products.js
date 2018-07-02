'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const lib = require('../../lib');
const siteName = "souq";

lib.start(siteName, getProductLinks);

async function getProductLinks(gotoUrl) {

  /** Visiting the first link */
  await nightmare.goto(gotoUrl);

  var haveMore = true;
  var pageNum = 1;
  
  /** if page has pagination */
  while (haveMore) {

    /** Log current scraping url */
    console.log(await nightmare.url());

    /** Start scraping the current url */
    await nightmare
      .wait(3000)
      .evaluate(function () {

        var links = [],
          pagination = window.location.search != "",
          productList = document.querySelectorAll('.block-grid-large');

        /** Going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('.itemTitle a')[0].innerText.trim(),
            "url": item.querySelectorAll('.itemTitle a')[0].href,
            "price": item.querySelectorAll('h5.price')[0].innerText.replace(' AED', '').trim(),
            "brand": item.querySelectorAll('[data-subcategory]')[0].getAttribute('data-subcategory'),
            "site": "souq",
          });
        });

        /** Return all the values */
        return {
          'links': links,
          'pagination': pagination
        };

      }).then(function (resalt) {
        haveMore = resalt.pagination;
        lib.PrepToSave(resalt.links, `${lib.APIbaseUrl}/api/products`);
      })

    /** Visiting the next page */
    if (haveMore) {
      await nightmare
      .goto(`${gotoUrl}?section=2&page=${pageNum++}`);
    }

  }
}
