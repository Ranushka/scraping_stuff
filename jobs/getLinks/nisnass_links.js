'use strict';

const Nightmare = require('nightmare');
const fetch = require('node-fetch');
const vo = require('vo');
const lib = require('../../lib');

console.log(`get main links start`);

var links = [
  "https://www.nisnass.ae/women/brands",
  "https://www.nisnass.ae/men/brands",
  "https://www.nisnass.ae/kids"
];

start();

async function start() {
  for (let link of links) {
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
      var brandPageList = document.querySelectorAll('.Brands-names a');
      var brandPageLinks = [];
      brandPageList.forEach(function (item) {

        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "nisnass",
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
