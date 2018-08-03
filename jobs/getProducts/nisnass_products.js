'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "nisnass";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare();

  console.log('start scraping init', urlToScrape);

  if (haveMore) {
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
     * now scraping url */
    var url = await nightmare.url();
    console.log(url);

    /** 
     * Scroll till page end */
    var previousHeight, currentHeight = 0;
    while (previousHeight !== currentHeight) {
      previousHeight = currentHeight;
      var currentHeight = await nightmare.evaluate(function () {
          return document.body.scrollHeight;
        })
        .scrollTo(currentHeight, 0)
        .wait(2000);
    }

    /** 
     * Start collecting product Data */
    await nightmare
      .wait(3000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.PLP-productList .Product'),
          category = document.querySelectorAll('.PLP-title')[0].innerText.trim();

        /** 
         * going through each product */
        productList.forEach(function (item) {

          let thisDataSet = {
            "brand": "",
            "category": category,
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": item.querySelectorAll('.Product-image')[0].src,
            "name": item.getElementsByClassName("Product-name")[0].innerText.trim(),
            "price": item.getElementsByClassName("Product-minPrice")[0].innerText.replace(' AED', ''),
            "shiping_cost": "",
            "site": "nisnass",
            "url": item.getElementsByClassName("Product-details")[0].href,
          }

          /** set brand if avalable*/
          let brandName = item.querySelectorAll('.Product-brand');
          if (brandName.length) {
            thisDataSet["brand"] = brandName[0].innerText.trim();
          }

          /** adding config options */
          let config = item.querySelectorAll('.Product-sizeListLinks');
          if (config.length) {
            let configOptions = []
            config.forEach((thisitem) => {
              configOptions.push({
                "text": thisitem.innerText.trim(),
                "link": thisitem.href,
              })
            })
            thisDataSet["config"] = configOptions;
          }

          links.push(thisDataSet);
        });

        /** 
         * return all the values */
        return {
          'links': links
        };

      })
      .then(async result => {
        await await lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/create`, urlToScrape);
      })
      .catch(error => {
        haveMore = false;
        logger.error(`init_scraping_fail | ${url} | ${error}`)
      })

    /** 
     * nightmare kill */
    console.log('kill nightmare - ', urlToScrape);
    await nightmare.end();
  }
}
