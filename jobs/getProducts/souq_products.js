'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "souq"

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare(),
    pageNum = 1;

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
    console.log(url);

    /** 
     * Start collecting product Data */
    await nightmare
      .wait(3000)
      .evaluate(function () {
        var links = [],
          abc = JSON.parse(document.querySelectorAll('.loadMore')[0].getAttribute('data-metadata'));
          productList = document.querySelectorAll('.block-grid-large'),
          pagination = abc.total_pages - abc.page;

        /** clean elements - remove was price */
        $('.was.block').remove();

        /** 
         * Going through each product */
        productList.forEach(function (item) {

          let thisDataSet = {
            "name": item.querySelectorAll('.itemTitle a')[0].innerText.trim(),
            "url": item.querySelectorAll('.itemTitle a')[0].href,
            "price": item.querySelectorAll('h5.price')[0].innerText.replace(' AED', '').trim(),
            "brand": item.querySelectorAll('[data-subcategory]')[0].getAttribute('data-brand'),
            "category": item.querySelectorAll('[data-subcategory]')[0].getAttribute('data-subcategory'),
            "site": "souq",
            "currency": "AED",
            "img": item.querySelectorAll('.img-size-medium')[0].src,
          }

          /** free shiping promo */
          let freeShipingText = item.querySelectorAll('.free-shipping');
          if (freeShipingText) {
            freeShipingText = freeShipingText[0].innerText.trim()
            thisDataSet["shiping_cost"] = freeShipingText;
          }

          /** order full filment */
          let fulFillBy = item.querySelectorAll('.flag-fbs').length;
          if (fulFillBy) {
            thisDataSet["fulfill"] = true;
          }
  
          links.push(thisDataSet);
        });

        /** 
         * Return all the values */
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
     * Visiting the next page */
    if (haveMore) {
      console.log('haveMore');
      await nightmare
        .goto(`${urlToScrape}?section=2&page=${pageNum++}`)
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
