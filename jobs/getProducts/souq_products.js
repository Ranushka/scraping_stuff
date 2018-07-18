'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const lib = require('../../lib');
const winston = require('winston')
const siteName = "souq";

// var logger = require('logger');

// logger.errorLog.info('Test error log');
// logger.accessLog.info('Test access log');

// logger.log('info', 'This is an information message.');

// winston.log('error', 'init_scraping_fail', 'dasdsa')

var logger = require('./../../logger');

// logger.errorLog.info('Test error log');
// logger.accessLog.info('Test access log');

// logger.log('info', 'This is an information message.');

logger.log('info', 'Hello created log files!', 'dsads');
logger.log('error', 'Hello created log files!', 'dsads');


lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare(),
    pageNum = 1;

  console.log('start scraping init', urlToScrape);

  await nightmare
    .goto(urlToScrape)
    .wait(lib.waitTime)
    .catch(error => {
      console.error('Error start scraping init', urlToScrape, error, '------------');
      haveMore = false;
      return;
    })

  /** 
   * lopp until pagination false */
  while (haveMore) {

    /** 
     * Visiting the first link */
    var url = await nightmare.url();
    console.log('inside while loop - ', url);

    /** 
     * Start scraping the current url */
    await nightmare
      .wait(3000)
      .evaluate(function () {

        var links = [],
          abc = JSON.parse(document.querySelectorAll('.loadMore')[0].getAttribute('data-metadata'));
          productList = document.querySelectorAll('.block-grid-large'),
          pagination = abc.total_pages - abc.page;

        /** 
         * Going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('.itemTitle a')[0].innerText.trim(),
            "url": item.querySelectorAll('.itemTitle a')[0].href,
            "price": item.querySelectorAll('h5.price')[0].innerText.replace(' AED', '').trim(),
            "brand": item.querySelectorAll('[data-subcategory]')[0].getAttribute('data-subcategory'),
            "site": "souq",
          });
        });

        /** 
         * Return all the values */
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
        console.error('scrape get data - ', error)
        winston.log('error', 'scrape_get_data', urlToScrape)
      })

    /** 
     * Visiting the next page */
    if (haveMore) {
      console.log('haveMore');
      await nightmare
        .goto(`${urlToScrape}?section=2&page=${pageNum++}`)
        .catch(error => {
          haveMore = false;
          console.error('paginating_error', url, error)
          winston.log('error', 'paginating_error', url)
        })
    }

  }

  /** 
   * nightmare kill */
  console.log('kill nightmare - ', urlToScrape);
  await nightmare.end();
}
