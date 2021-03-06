'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "noon";

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
          productList = document.querySelectorAll('.productContainer'),
          pagination = !document.querySelectorAll('.next.disabled').length > 0,
          brand = document.querySelectorAll('.breadcrumb a:last-child')[0].innerText.trim();

        /** 
         * going through each product */
        productList.forEach(function (item) {


          let thisDataSet = {
            "brand": "",
            "category": brand,
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": item.querySelectorAll('.mediaContainer img')[0].src,
            "name": item.querySelectorAll('.name')[0].innerText.trim(),
            "price": item.querySelectorAll('.sellingPrice')[0].innerText.trim().replace('AED ', ''),
            "shiping_cost": "",
            "site": "noon",
            "sku": "",
            "url": item.querySelectorAll('.product')[0].href,
          }

          /** set brand if avalable*/
          let brandName = item.querySelectorAll('.fulfilmentContainer img');
          if (brandName.length) {
            thisDataSet["brand"] = item.querySelectorAll('.brand')[0].innerText.trim();
          }

          /** free shiping promo */
          if (parseInt(thisDataSet.price) >= 100) {
            thisDataSet["shiping_cost"] = 'free shipping';
          }

          /** order full filment */
          let fulFillBy = item.querySelectorAll('.fulfilmentContainer img');
          if (fulFillBy.length) {
            thisDataSet["fulfill"] = true;
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
          document.querySelectorAll('li.next a')[0].click();
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
