'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "brandsforless";

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
          productList = document.querySelectorAll('.plp-list__item'),
          pagination = Boolean(document.querySelectorAll('.plp-pagination__navnext')[0].href != window.location.href);

        /** 
         * going through each product */
        productList.forEach(function (item) {

          let dataFomGTM = JSON.parse(item.getElementsByClassName("js-gtmProdData")[0].dataset.gtmProdData);

          let thisDataSet = {
            "brand": dataFomGTM.brand,
            "category": "",
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": item.getElementsByClassName("comp-productcard__img")[0].src,
            "name": dataFomGTM.name,
            "price": dataFomGTM.price,
            "shiping_cost": "",
            "site": "brandsforless",
            "sku": dataFomGTM.id,
            "url": item.querySelectorAll('.comp-productcard__img')[0].href,
          }

          let configs = item.querySelectorAll('.cat_tags span');
          if (configs.length) {
            let configItems = []
            configs.forEach((thisitem) => {
              configItems.push(thisitem.innerText.trim().toLowerCase())
            })
            thisDataSet["config"] = configItems;
          }

          links.push(thisDataSet);

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
        await lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/create`, urlToScrape);
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
          document.querySelectorAll('.plp-pagination__navnext')[0].click();
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
