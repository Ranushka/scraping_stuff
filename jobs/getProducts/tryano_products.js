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
  urlToScrape = `${urlToScrape}?product_list_limit=72`;

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
          productList = document.querySelectorAll('.product-items li.product'),
          pagination = Boolean(document.querySelectorAll('.toolbar__pager-item--next').length),
          tagsElemnts = document.querySelectorAll('.breadcrumbs li:not(:first-child)'),
          tags = [];

        /** 
         * Start collecting product Data */
        tagsElemnts.forEach(function (a) {
          tags.push(a.innerText.toLowerCase().trim())
        })

        /** 
         * going through each product */
        productList.forEach(function (item) {

          let thisDataSet = {
            "brand": item.querySelectorAll('.product__brand')[0].innerText.trim(),
            "category": tags,
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": item.querySelectorAll('.product-image-photo')[0].src,
            "name": item.getElementsByClassName('product-item-link')[0].innerText.trim(),
            "price": item.querySelectorAll('[data-price-amount]')[0].dataset.priceAmount,
            "shiping_cost": "",
            "site": "tryano",
            "sku": "",
            "url": item.getElementsByClassName('product-item-link')[0].href,
          }

          /** set sku */
          let skuElement = item.getElementsByClassName("price-box");
          if (skuElement.length) {
            thisDataSet["sku"] = skuElement[0].dataset.productId;
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
