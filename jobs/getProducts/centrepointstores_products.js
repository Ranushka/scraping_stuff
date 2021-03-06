'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "centrepointstores";

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
    console.log(url);

    await nightmare
      .wait(lib.waitTime)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.product-item'),
          pagination = Boolean(document.querySelectorAll('[class="next"]').length),
          tagsElemnts = document.querySelectorAll('.breadcrumb > li > a'),
          tags = [];

        /** 
         * Start collecting product Data */
        tagsElemnts.forEach(function (a) {
          tags.push(a.innerText)
        });

        /** 
         * going through each product */
        productList.forEach(function (item) {

          let thisDataSet = {
            "brand": item.querySelectorAll('[itemprop="concept"]')[0].innerText.trim(),
            "category": tags,
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": "",
            "name": item.querySelectorAll('[itemprop="name"]')[0].innerText.trim(),
            "price": item.querySelectorAll('[itemprop="price"]')[0].innerText.trim(),
            "shiping_cost": "",
            "site": "centrepointstores",
            "sku": item.dataset.id,
            "url": item.querySelectorAll(".product-link")[0].href,
          }

          /** set image */
          let prodImage = item.querySelectorAll('.product-image');
          if (prodImage.length) {
            thisDataSet["img"] = prodImage[0].style['background-image'].replace('url("', '').replace('")', '');
          }

          /** adding config options */
          let config = item.querySelectorAll('.size-list.active');
          if (config.length) {
            let configOptions = []
            config.forEach((thisitem) => {
              configOptions.push({
                "text": thisitem.innerText.trim()
              })
            })
            thisDataSet["config"] = configOptions;
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
      await nightmare
        .click('.next')
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
