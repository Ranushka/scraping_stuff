'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');

console.log(`get main links start`);

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
    .then(function (result) {
      lib.PrepToSave(result, `${lib.APIbaseUrl}/api/links/createOrUpdate`, urlToScrape);
    })
    .catch(function (error) {
      console.error(`Error - `, error);
    });
}
