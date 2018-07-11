'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "babyshopstores";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare();

  console.log('start scraping init', urlToScrape);

  /** 
   * visiting init page url */
  await nightmare
    .goto(urlToScrape)
    .wait(lib.waitTime)
    .catch(error => {
      haveMore = false;
      console.error('Error start scraping init', urlToScrape, error);
    })

  /** 
   * lopp until pagination false */
  while (haveMore) {

    //
    // ─── LOGING SCRAPING SITE URL ────────────────────────────────────
    //
    var url = await nightmare.url();
    console.log(url);

    await nightmare
      .wait(lib.waitTime)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.product-item'),
          pagination = document.querySelectorAll('[class="next"]').length ? true : false,
          tagsElemnts = document.querySelectorAll('.breadcrumb > li > a'),
          tags = [];

        /** 
         * Start collecting product Data */
        tagsElemnts.forEach(function (a) {
          tags.push(a.innerText)
        });

        /** 
         * going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('[itemprop="name"]')[0].innerText.trim(),
            "url": item.querySelectorAll(".product-link")[0].href,
            "price": item.querySelectorAll('[itemprop="price"]')[0].innerText.trim(),
            "brand": tags,
            "site": "babyshopstores",
          });
        });

        /** 
         * return all the values */
        return {
          'links': links,
          'pagination': pagination
        };

      })
      .then(function (result) {
        haveMore = result.pagination;
        lib.PrepToSave(result.links, `${lib.APIbaseUrl}/api/products/createOrUpdate`, urlToScrape);
      })
      .catch(error => {
        haveMore = false;
        console.error('scrape get data - ', error)
      })

    /** 
     * Paginating if avalable */
    if (haveMore) {
      await nightmare
        .click('.next')
        .catch(() => {
          haveMore = false;
        })
    }
  }

  /** 
   * nightmare kill */
  console.log('kill nightmare - ', urlToScrape);
  await nightmare.end();
}
