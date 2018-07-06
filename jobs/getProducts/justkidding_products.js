'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const lib = require('../../lib');
const siteName = "justkidding";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {

  await nightmare.goto(urlToScrape);

  var haveMore = true;

  /** 
   * lopp until pagination false
   */
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

        /** going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.getElementsByClassName('product-name')[0].innerText,
            "url": item.getElementsByClassName('product-name')[0].href,
            "price": item.readAttribute('data-v'),
            "brand": brand,
            "site": "justkidding",
          });
        });

        /** retun links n have more */
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
      /** click to naviagte in paginatin */
      await nightmare
        .evaluate(function () {
          document.getElementsByClassName('i-next')[0].click()
        })
    }
  }
  
  /** nightmare kill */
  await nightmare.end();
}
