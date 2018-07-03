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
  for ( let link of links ) {
    console.log(link)
    await getMultipalSoursLinks(link)
  }
}

async function getMultipalSoursLinks(params) {
  console.log('get main links', params);
  var nightmare = Nightmare();

  await nightmare
    .goto(`${params}`)
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
      lib.PrepToSave(result, `${lib.APIbaseUrl}/api/links/createOrUpdate`);
    })
    .catch(function (error) {
      console.error(`Error - `, error);
    });
}