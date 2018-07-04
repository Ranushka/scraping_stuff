'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');

console.log(`get main links start`);

var links = [
  "https://www.justkidding-me.com/"
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
      var brandPageList = document.querySelectorAll('#queldoreiNav ol > li > a');
      var brandPageLinks = [];
      brandPageList.forEach(function (item) {
        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "justkidding",
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
