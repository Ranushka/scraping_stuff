'use strict';

const Nightmare = require('nightmare');
const fetch = require('node-fetch');
const vo = require('vo');
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
    .then(function (result) {
      lib.PrepToSave(result, `${lib.APIbaseUrl}/api/links/createOrUpdate`, urlToScrape);
    })
    .catch(function (error) {
      console.error(`Error - `, error);
    });
}






'use strict';

const Nightmare = require('nightmare');
const fetch = require('node-fetch');
const vo = require('vo');
const lib = require('../../lib');

console.log(`get main links start`);

var links = [
  "https://www.noon.com/en-ae/baby"
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
      var brandPageList = document.querySelectorAll('[class*="sectionContent"]')[0].querySelectorAll('li a');
      var brandPageLinks = [];
      brandPageList.forEach(function (item) {
        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "noon",
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
