'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "carrefouruae";

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
      console.error('Error start scraping init', urlToScrape, error, '--------------------------------');
    })

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
          productList = document.querySelectorAll('.plp-list__item'),
          pagination = document.querySelectorAll('.plp-pagination__nav:last-child')[0].classList.length == 1,
          tags = document.querySelectorAll('.comp-breadcrumb__item:last-child')[0].innerText.trim();

        /** 
         * going through each product */
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('.comp-productcard__img')[0].title.trim(),
            "url": item.querySelectorAll(".comp-productcard__wrap > a")[0].href,
            "price": item.querySelectorAll('.comp-productcard__price')[0].innerText.trim(),
            "brand": tags,
            "site": "carrefouruae",
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
      console.log('haveMore');
      await nightmare
        .evaluate(function () {
          document.querySelectorAll('.plp-pagination__nav:last-child a')[0].click();
        })
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