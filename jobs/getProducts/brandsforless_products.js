'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "tryano";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare();

  /** 
   * getting 72 products to the page */
  urlToScrape = `${urlToScrape}&page=1_96`;

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
   * lopp until pagination false */
  while (haveMore) {

    /** 
     * now scraping url */
    var url = await nightmare.url();
    console.log(url);

    /** 
     * Start collecting product Data */
    await nightmare
      .wait(lib.waitTime)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.moduleBox'),
          pagination = Boolean(document.querySelectorAll('.toolbar__pager-item--next').length);

        /** 
         * going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('.itemname')[0].innerText.trim().toLowerCase(),
            "url": item.querySelectorAll('.imageBox a')[0].href,
            "price": item.querySelectorAll('.price')[0].innerText.replace('AED', '').trim(),
            "brand": item.querySelectorAll('.brandname')[0].innerText.trim().toLowerCase(),
            "site": "brandsforless",
          })
        })

        /** 
         * return all the values */
        return {
          'links': links,
          'pagination': pagination
        };

      })
      .then(async result => {
        haveMore = result.pagination;
        await lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/createOrUpdate`, urlToScrape);
      })
      .catch(error => {
        haveMore = false;
        logger.error(`init_scraping_fail | ${url} | ${error}`)
      })

    /** 
     * Paginating if avalable */
    if (haveMore) {
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('.toolbar__pager-item--next .action')[0].click();
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
