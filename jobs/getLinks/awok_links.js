'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');

console.log(`get main links start`);

var links = [
  "https://ae.awok.com/babies-kids-games/ds-1025/"
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
      var brandPageList = document.querySelectorAll('.sub_cat .disableonclick');
      var brandPageLinks = [];
      brandPageList.forEach(function (item) {
        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": window.location.origin + item.getAttribute('data-loadurl'),
          "site": "awok",
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
    
    /** nightmare kill */
    await nightmare.end();
}
