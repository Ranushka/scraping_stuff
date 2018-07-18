'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const winston = require('winston')

console.log(`get main links start`);

var logger = require('logger');

// logger.errorLog.info('Test error log');
// logger.accessLog.info('Test access log');

logger.log('info', 'This is an information message.');




var links = [
  "https://deals.souq.com/ae-en/baby-and-toys/cc/360"
];

start();

async function start() {
  for (let link of links) {
    await getMultipalSoursLinks(link)
  }
}

async function getMultipalSoursLinks(urlToScrape) {
  console.log('get main links', urlToScrape);
  var nightmare = Nightmare();

  await nightmare
    .goto(`${urlToScrape}`)
    .wait(2000)
    .evaluate(function () {

      var brandPageList = document.querySelectorAll('.block-grid a');
      var brandPageLinks = [];

      brandPageList.forEach(function (item) {
        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "souq",
          "scrap": false
        });
      });

      return brandPageLinks;
    })
    .then(async result => {
      await lib.PrepToSave(result, `${lib.APIbaseUrl}/api/links/createOrUpdate`, urlToScrape);
    })
    .catch(function (error) {
      console.error(`Error - `, error);
      winston.log('error', 'get_sours_links', urlToScrape)
    });

  /** nightmare kill */
  await nightmare.end();
}
