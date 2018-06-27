'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../../lib');
const siteName = "noon";

lib.start(siteName, getProductLinks);

async function getProductLinks(gotoUrl) {

  await nightmare.goto(gotoUrl);

  var haveMore = true;

  while (haveMore) {

    // loging scraping site url
    var url = await nightmare.url();
    console.log(url);

    await nightmare
      .wait(4000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('[class*="ProductBox__wrapper"] a'),
          pagination = document.querySelectorAll('[class*="Pagination__nextLink"]')[0].parentElement.offsetWidth > 0;

        // going through each product
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('[class*="ProductBox__productName"]')[0].innerText,
            "url": item.href,
            "price": item.getElementsByClassName('value')[0].innerText.trim(),
            "brand": item.querySelectorAll('[class*="ProductBox__brandName"]')[0].innerText.trim(),
            "site": "noon",
          });
        });

        // return all the values
        return {
          'links': links,
          'pagination': pagination
        };

      }).then(function (resalt) {
        haveMore = resalt.pagination;
        vo(lib.saveToDb)(resalt.links, function (err, result) {
          if (err) throw err;
        });
      })

    if (haveMore) {
      console.log('haveMore');
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('[class*="Pagination__nextLink"]')[0].click()
        })
        .wait(3000);
    }
  }
}





