'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "mumzworld";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare();

  console.log('start scraping init', urlToScrape);

  await nightmare
    .goto(urlToScrape)
    .wait(lib.waitTime)
    .catch(error => {
      console.error('Error start scraping init', urlToScrape, error);
      haveMore = false;
    })
    .catch();

  /** 
   * lopp until pagination false */
  while (haveMore) {

    /** 
     * now scraping url */
    var url = await nightmare.url();
    console.log('inside while loop - ', url);

    /** 
     * Start collecting product Data */
    await nightmare
      .wait(lib.waitTime)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.products-grid a.product-image'),
          pagination = document.querySelectorAll('.toolbar .sprite_img.next.i-next').length > 0;

        /** 
         * going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.title,
            "url": item.href,
            "price": item.dataset.pprice,
            "brand": item.dataset.pbrand,
            "site": 'mumzworld',
          });
        });

        /** 
         * return all the values */
        return {
          'links': links,
          'pagination': pagination
        };

      })
      .then(async result => {
        haveMore = result.pagination;
        await lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/createOrUpdate`, urlToScrape);
      })
      .catch(error => {
        console.error('scrape get data - ', error)
      })

    //
    // ─── CHECK HAVE MORE TO THE PAGE ─────────────────────────────────
    //
    if (haveMore) {
      console.log('haveMore');
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('.toolbar .sprite_img.next.i-next')[0].click();
        })
        .catch(error => {
          console.error('click error - ', error)
        })
    }
  }

  /** 
   * nightmare kill */
  console.log('kill nightmare - ', urlToScrape);
  await nightmare.end();
}
