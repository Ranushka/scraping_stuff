'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../lib');
const siteName = "awok";

lib.start(siteName, getProducts, getLinks);

async function getProducts(gotoUrl) {

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


/* 
* get links 
*/
async function getLinks() {

  var nightmare = Nightmare();
  var aaa = [
    "https://ae.awok.com/babies-kids-games/ds-1025/"
  ];

  for (let linkUrl of aaa) {

    console.log(linkUrl);

    await nightmare
      .goto(`${linkUrl}`)
      .wait(2000)
      .evaluate(function () {
        // get only baby prducts
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
      .end()
      .then(function (result) {
        vo(lib.linksPrepToSave)(result, function (err) {
          console.log(err)
          if (err) throw err;
        });
      })
      .catch(function (error) {
        console.error('Error:', error);
      });

  }

}