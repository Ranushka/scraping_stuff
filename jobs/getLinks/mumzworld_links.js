'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const winston = require('winston')

console.log(`get main links start`);

var links = [
  "http://www.mumzworld.com/en/"
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
      var brandPageList = document.querySelectorAll('#custommenu h2.level2title a'),
        brandPageLinks = [];

      brandPageList.forEach(function (item) {
        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "mumzworld",
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
