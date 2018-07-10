'use strict';

const Nightmare = require('nightmare');
const lib = require('../../lib');
const siteName = "gap";

lib.start(siteName, getProductLinks);

async function getProductLinks(urlToScrape) {
  let haveMore = true,
    nightmare = new Nightmare(),
    page = 0;

  console.log('start scraping init', urlToScrape);

  /** 
   * visiting init page url 
   * set cookie */
  await nightmare
    .goto(`https://www.gap.ae/`)
    .wait(4000)
    .evaluate(function () {
      document.cookie = "prod___delivery_type_changed=true";
    })
    .catch(error => {
      haveMore = false;
      console.error('Error start scraping init', urlToScrape, error);
    })

  /** 
   * lopp until pagination false */
  while (haveMore) {

    /** 
     * visiting paginated url */
    await nightmare
      .goto(`${urlToScrape}?p=${page++}`)
      .catch(error => {
        haveMore = false;
        console.error('Error start scraping init', urlToScrape, error);
      })

    /** 
     * now scraping url */
    var url = await nightmare.url();
    console.log('inside while loop - ', url);

    /** 
     * Start collecting product Data */
    await nightmare
      .wait(4000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.product-item'),
          pagination = document.querySelectorAll('.load-more').length > 0;

        /** 
         * going through each product */
        productList.forEach(function (item) {
          var data = JSON.parse(URI.decode(item.getAttribute('data-gtm-product')));
          links.push({
            "name": data.name,
            "url": item.href,
            "price": data.price,
            "brand": data.dimension6,
            "site": "gap",
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
  }

  /** 
   * nightmare kill */
  console.log('kill nightmare - ', urlToScrape);
  await nightmare.end();
}
