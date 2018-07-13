'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "kidore";

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
          productList = document.querySelectorAll('.product-wrap'),
          pagination = Boolean(document.querySelectorAll('.i-next').length),
          tagsElemnts = document.querySelectorAll('.breadcrumb li a'),
          tags = [];

        /** 
         * Start collecting product Data */
        tagsElemnts.forEach(function (a) {
          tags.push(a.innerText.toLowerCase());
        });

        /** 
         * going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('h4')[0].innerText.trim(),
            "url": item.querySelectorAll('.image-wrap a')[0].href,
            "price": item.getElementsByClassName('price')[0].innerText.replace('AED', ''),
            "brand": tags,
            "site": "kidore",
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
        haveMore = false;
        console.error('scrape get data - ', error)
      })

    /** 
     * Paginating if avalable */
    if (haveMore) {
      await nightmare
        .click('.i-next')
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
