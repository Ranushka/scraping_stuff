'use strict';

const Nightmare = require('nightmare');
const nightmare = Nightmare();
const vo = require('vo');
const lib = require('../lib');
const siteName = "mumzworld";

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
      .evaluate(function (siteName, result) {

        var links = [],
          productList,
          pagination = '';

          try {

            productList = document.querySelectorAll('.products-grid a.product-image'),
            pagination = document.querySelectorAll('.toolbar .sprite_img.next.i-next').length > 0;

            // going through each product
            productList.forEach(function (item) {
              links.push({
                "name": item.title,
                "url": item.href,
                "price": item.dataset.pprice,
                "brand": item.dataset.pbrand,
                "site": siteName,
              });
            });

          } catch (error) {
            
          }

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
          document.querySelectorAll('.toolbar .sprite_img.next.i-next')[0].click();
        })
        .wait(3000);
    }
  }
}

