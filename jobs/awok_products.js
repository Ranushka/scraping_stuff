'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../lib');
const siteName = "awok";

lib.start(siteName, getProductLinks);

async function getProductLinks(gotoUrl) {

  await nightmare.goto(gotoUrl);

  var haveMore = true;

  while (haveMore) {

    // loging scraping site url
    var url = await nightmare.url();
    console.log(url);

    await nightmare
      .wait(3000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.productslist_item_link'),
          tags = document.querySelectorAll('.heading_section')[0].innerText.trim(),
          pagination = document.querySelectorAll('.modern-page-next').length > 0;

        // going through each product
        productList.forEach(function (item) {
          links.push({
            "name": item.getElementsByClassName('productslist_item_title')[0].innerText.trim(),
            "url": item.href,
            "price": item.getElementsByClassName('productslist_item_pricenew')[0].innerText.replace(' AED', ''),
            "brand": tags,
            "site": "awok",
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
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('.modern-page-next')[0].click();
        })
        .wait(3000);
    }
  }
}
