'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "mumzworld";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare();

  console.log('start scraping init', urlToScrape);

  await nightmare
    .goto(urlToScrape)
    .wait(lib.waitTime)
    .catch(error => {
      haveMore = false;
      logger.error(`init_scraping_fail | ${urlToScrape} | ${error}`)
    })

  /** 
   * lopp until pagination false */
  while (haveMore) {

    /** 
     * now scraping url */
    var url = await nightmare.url();
    console.log('inside while loop - ', url);

    /** 
     * Start collecting product Data */
    await nightmare
      .wait(lib.waitTime)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.products-grid a.product-image'),
          pagination = document.querySelectorAll('.toolbar .sprite_img.next.i-next').length > 0;

        /** 
         * going through each product */
        productList.forEach(function (item) {

          let thisDataSet = {
            "brand": "",
            "category": item.dataset.pbrand,
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": "",
            "name": item.title,
            "price": item.dataset.pprice,
            "shiping_cost": "",
            "site": 'mumzworld',
            "url": item.href,
          }

          links.push(thisDataSet);
        });

        /** 
         * return all the values */
        return {
          'links': links,
          'pagination': pagination
        };

      })
      .then(async result => {
        haveMore = result.pagination;
        await lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/create`, urlToScrape);
      })
      .catch(error => {
        haveMore = false;
        logger.error(`init_scraping_fail | ${url} | ${error}`)
      })

    /** 
     * Paginating if avalable */
    if (haveMore) {
      console.log('haveMore');
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('.toolbar .sprite_img.next.i-next')[0].click();
        })
        .catch(error => {
          haveMore = false;
          logger.error(`paginating_error | ${url} | ${error}`)
        })
    }
  }

  /** 
   * nightmare kill */
  console.log('kill nightmare - ', urlToScrape);
  await nightmare.end();
}
