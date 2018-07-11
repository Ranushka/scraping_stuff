'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "justkidding";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare();

  console.log('start scraping init', urlToScrape);

  /** 
   * visiting init page url */
  await nightmare
    .goto(urlToScrape)
    .wait(lib.waitTime)
    .catch(error => {
      haveMore = false;
      console.error('Error start scraping init', urlToScrape, error);
    })

  /** 
   * lopp until pagination false
   */
  while (haveMore) {

    var url = await nightmare.url();
    console.log('inside while loop - ', url);

    await nightmare
      .wait(lib.waitTime)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.products-grid .item'),
          pagination = document.getElementsByClassName('i-next') > 0,
          brand = document.getElementsByClassName('block-title')[0].innerText;

        /** 
         * going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.getElementsByClassName('product-name')[0].innerText,
            "url": item.getElementsByClassName('product-name')[0].href,
            "price": item.readAttribute('data-v'),
            "brand": brand,
            "site": "justkidding",
          });
        });

        /** 
         * return all the values */
        return {
          'links': links,
          'pagination': pagination
        };

      })
      .then(function (result) {
        haveMore = result.pagination;
        lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/createOrUpdate`, urlToScrape);
      })
      .catch(error => {
        console.error('scrape get data - ', error)
      })

    /** 
     * Paginating if avalable */
    if (haveMore) {
      console.log('haveMore');
      await nightmare
        .evaluate(function () {
          document.getElementsByClassName('i-next')[0].click()
        })
        .catch(() => {
          haveMore = false;
        })
    }
  }

  /** 
   * nightmare kill */
  console.log('kill nightmare - ', urlToScrape);
  await nightmare.end();
}
