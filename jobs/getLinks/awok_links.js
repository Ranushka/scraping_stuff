'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const logger = require('../../logger');

console.log(`get main links start`);

var links = [
  "https://ae.awok.com/help-info/site-map/"
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

      $('span').remove() // remove unvonted spans frm the dom

      var brandPageList = document.querySelectorAll('.sitemap_contant li a');
      var brandPageLinks = [];
      brandPageList.forEach(function (item) {
        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": window.location.origin + item.href.split('/ds-')[0], // split url to skip cash pagers
          "site": "awok",
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
