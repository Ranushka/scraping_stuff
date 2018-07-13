'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');

console.log(`get main links start`);

var links = [
  "https://www.babyshopstores.com/ae/en/department/clothing",
  "https://www.babyshopstores.com/ae/en/department/babygear",
  "https://www.babyshopstores.com/ae/en/department/toys",
  "https://www.babyshopstores.com/ae/en/search/?q=%20%3AallCategories%3Adiapers",
  "https://www.babyshopstores.com/ae/en/department/nurseryandfeeding"
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
      var brandPageList = document.querySelectorAll('#filter-form-sub-categories li:not(.visible-xs)>a');
      var brandPageLinks = [];
      brandPageList.forEach(function (item) {

        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "babyshopstores",
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
