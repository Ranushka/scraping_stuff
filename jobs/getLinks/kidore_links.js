'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('./../../logger');

console.log(`get main links start`);

var links = [
  "https://www.kidore.com/toys-everywhere/activity-books",
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
    .wait(4000)
    .evaluate(function () {
      var brandPageList = document.querySelectorAll('.nav .sub-menu a');
      var brandPageLinks = [];
      brandPageList.forEach(function (item) {

        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "kidore",
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
      logger.error(`get_sours_links | ${urlToScrape}`)
    });

  /** nightmare kill */
  await nightmare.end();
}
