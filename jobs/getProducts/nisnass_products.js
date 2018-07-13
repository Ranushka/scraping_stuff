'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
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
        console.error('Error start scraping init', urlToScrape, error);
        haveMore = false;
        return;
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
          productList = document.querySelectorAll('.PLP-productList .Product');

        /** 
         * going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.getElementsByClassName("Product-name")[0].innerText.trim(),
            "url": item.getElementsByClassName("Product-details")[0].href,
            "price": item.getElementsByClassName("Product-minPrice")[0].innerText.replace(' AED', ''),
            "brand": item.getElementsByClassName("Product-brand")[0].innerText.trim(),
            "site": "nisnass",
          });
        });

        /** 
         * return all the values */
        return {
          'links': links
        };

      })
      .then(async result => {
        await await lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/createOrUpdate`, urlToScrape);
      })
      .catch(error => {
        console.error('scrape get data - ', error)
      })

    /** 
     * nightmare kill */
    console.log('kill nightmare - ', urlToScrape);
    await nightmare.end();
  }
}
