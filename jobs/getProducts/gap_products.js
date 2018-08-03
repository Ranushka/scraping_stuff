'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "gap";
const logger = require('../../logger');

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare(),
    page = 0;

  console.log('start scraping init', urlToScrape);

  /** 
   * visiting init page url 
   * set cookie */
  await nightmare
    .goto(`https://www.gap.ae/`)
    .wait(lib.waitTime)
    .evaluate(function () {
      document.cookie = "prod___delivery_type_changed=true";
    })
    .catch(error => {
      haveMore = false;
      logger.error(`init_scraping_fail | ${urlToScrape} | ${error}`)
    })

  /** 
   * lopp until pagination false */
  while (haveMore) {

    /** 
     * visiting paginated url */
    await nightmare
      .goto(`${urlToScrape}?p=${page++}`)
      .catch(error => {
        haveMore = false;

        logger.log('error', 'paginating_error', urlToScrape)
      })

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
          productList = document.querySelectorAll('.product-item'),
          pagination = document.querySelectorAll('.load-more').length > 0;

        /** 
         * going through each product */
        productList.forEach(function (item) {

          var data = JSON.parse(URI.decode(item.getAttribute('data-gtm-product')));

          let thisDataSet = {
            "brand": "gap",
            "category": data.category.split('/'),
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": "",
            "name": data.name,
            "price": data.price,
            "shiping_cost": "",
            "site": "gap",
            "sku": data.id,
            "url": item.href,
          }

          /** adding config options */
          let config = item.querySelectorAll('.sizes .owl-item:not(.cloned)');
          if (config.length) {
            let configOptions = []
            config.forEach((thisitem) => {
              configOptions.push({
                "text": thisitem.innerText.trim()
              })
            })
            thisDataSet["config"] = configOptions;
          }

          /** set image */
          let prodImage = item.querySelectorAll('.img-loaded img');
          if (prodImage.length) {
            thisDataSet["img"] = prodImage[0].src;
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
        logger.error(`paginating_error | ${url} | ${error}`)
      })
  }

  /** 
   * nightmare kill */
  console.log('kill nightmare - ', urlToScrape);
  await nightmare.end();
}
