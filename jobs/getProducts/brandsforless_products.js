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
          productList = document.querySelectorAll('.moduleBox'),
          pagination = Boolean(!document.querySelectorAll('[id*=NextButton][onclick="return false;"]').length);

        /** 
         * going through each product */
        productList.forEach(function (item) {

          let thisDataSet = {
            "brand": item.querySelectorAll('.brandname')[0].innerText.toLowerCase(),
            "category": "",
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": item.querySelectorAll('.imageBox img')[0].src,
            "name": item.querySelectorAll('.itemname')[0].innerText.trim().toLowerCase(),
            "price": item.querySelectorAll('.price')[0].innerText.replace('AED', '').trim(),
            "shiping_cost": "",
            "site": "brandsforless",
            "url": item.querySelectorAll('.imageBox a')[0].href,
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
          document.querySelectorAll('[id*=NextButton]')[0].click();
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
