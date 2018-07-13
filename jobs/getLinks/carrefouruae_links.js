'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');

console.log(`get main links start`);

var links = [
  "https://www.carrefouruae.com/mafuae/en"
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
      // get only baby prducts
      var brandPageList = document.querySelectorAll('.category-block__item:nth-child(5)');
      var brandPageLinks = [];
      brandPageList.forEach(function (item) {
        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "carrefouruae",
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
    });

  /** nightmare kill */
  await nightmare.end();
}
