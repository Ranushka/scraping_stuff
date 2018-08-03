'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');
const siteName = "elabelz";

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
          productList = document.querySelectorAll('#catalog_listings .listing a'),
          pagination = Boolean(document.querySelectorAll('.next.i-next').length);

        jQuery('.old-price').remove() // remove all spcial price for easy data scrape

        /** 
         * going through each product */
        productList.forEach(function (item) {

          let thisDataSet = {
            "brand": item.querySelectorAll('.brand')[0].innerText.trim(),
            "category": "",
            "config": "",
            "currency": "AED",
            "fulfill": "",
            "img": "",
            "name": item.title,
            "price": item.querySelectorAll('.price .price')[0].innerText.replace('AED ', ''),
            "shiping_cost": "",
            "site": "elabelz",
            "url": item.href,
          }

          /** set image */
          let prodImage = item.querySelectorAll('.image_container img');
          if (prodImage.length) {
            thisDataSet["img"] = prodImage[0].src;
          }

          /** set category */
          let thisCategorys = document.querySelectorAll('.col-main .breadcrumbs li[class^=category]');
          if (thisCategorys.length) {
            let configOptions = []
            thisCategorys.forEach((thisitem) => {
              configOptions.push(thisitem.innerText.replace(' /', '').trim())
            })
            thisDataSet["category"] = configOptions;
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
          document.querySelectorAll('.next.i-next')[0].click();
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
