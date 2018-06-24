'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../lib');
const siteName = "nisnass";

async function getProductLinks(gotoUrl) {

  await nightmare.goto(gotoUrl);

  // loging scraping site url
  var url = await nightmare.url();
  console.log(url);

  // scroll to the end
  var previousHeight, currentHeight = 0;
  while (previousHeight !== currentHeight) {
    previousHeight = currentHeight;
    var currentHeight = await nightmare.evaluate(function () {
      return document.body.scrollHeight;
    });
    await nightmare.scrollTo(currentHeight, 0)
      .wait(2000);
  }

  await nightmare
    .wait(3000)
    .evaluate(function () {

      var links = [],
        productList = document.querySelectorAll('.PLP-productList .Product');

      // going through each product
      productList.forEach(function (item) {
        links.push({
          "name": item.getElementsByClassName("Product-name")[0].innerText.trim(),
          "url": item.getElementsByClassName("Product-details")[0].href,
          "price": item.getElementsByClassName("Product-minPrice")[0].innerText.replace(' AED', ''),
          "brand": item.getElementsByClassName("Product-brand")[0].innerText.trim(),
          "site": "nisnass",
        });
      });

      // return all the values
      return {
        'links': links,
        'nextExists': nextExists
      };

    }).then(function (resalt) {
      lib.nextExists = resalt.nextExists;
      vo(lib.saveToDb)(resalt.links, function (err, result) {
        if (err) throw err;
      });
    })

  nightmare.end();
}



lib.start(siteName, getProductLinks);
