'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "childrensalon";

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
          productList = document.querySelectorAll('.products-grid li.product-item:not(.empty-item)'),
          pagination = Boolean(document.querySelectorAll('.pages li.next a').length);

        /** 
         * going through each product */
        productList.forEach(function (item) {

          let thisDataSet = {
            "brand": item.querySelectorAll('.designer')[0].innerText.trim(),
            "category": "",
            "config": "",
            "currency": "AED",
            "fulfill": "Aramex, DHL",
            "img": "",
            "name": item.querySelectorAll('.product-name a')[0].href,
            "price": item.querySelectorAll('.price')[0].innerText.replace('AED', '').trim(),
            "shiping_cost": "",
            "site": "childrensalon",
            "url": item.querySelectorAll('.product-name a')[0].href,
          }

          /** set image */
          let prodImage = item.querySelectorAll('.product-item img');
          if (prodImage.length) {
            thisDataSet["img"] = prodImage[0].style['background-image'].replace('url("', '').replace('")', '');
          }

          /** adding config options */
          let config = item.querySelectorAll('.options-items span');
          if (config.length) {
            let configOptions = []
            config.forEach((thisitem) => {
              configOptions.push({
                "text": thisitem.innerText.trim(),
                "link": "",
              })
            })
            thisDataSet["config"] = configOptions;
          }

          /** set category */
          let thisCategory = document.querySelectorAll('.category-foot-slider .ctegory-title');
          if (thisCategory.length) {
            thisCategory = thisCategory[0].innerText.trim()
            thisDataSet["category"] = thisCategory;
          }

          links.push(thisDataSet)
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
          window.location = document.querySelectorAll('.pages li.next a')[0].href;
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
