'use strict';

const Xvfb = require('xvfb');
const Nightmare = require('nightmare');
const fetch = require('node-fetch');
const vo = require('vo');
let pm2 = require('pm2');

const xvfb = new Xvfb({
  silent: true
});

const nightmare = Nightmare({
  show: false
});

xvfb.startSync();

const siteName = "carrefouruae";

var nextExists = true;

vo(start)(function (err, result) {
  if (err) throw err;
});

function* start() {

  let i = 0;
  let nextMainLink = true;

  console.log('kicking off')

  while (nextMainLink) {
    let link, urlToScrap;
    urlToScrap = yield getNewScrapURL();

    console.log('nextMainLink --- ', nextMainLink)

    if (urlToScrap.greeting) {
      nextExists = true;
      yield getProductLinks(urlToScrap.greeting.url);
    } else {
      nextMainLink = false;
    }

    i++;
  }

  xvfb.stopSync();
  pm2.killDaemon();
  console.log(`${siteName} done save data ${i}`);

}

function* getNewScrapURL() {
  return yield fetch(`https://sitedata-mum.herokuapp.com/api/links/nextScrapLink?site=${siteName}`, {
      method: 'GET'
    }).then(res => res.json())
    .then(json => {
      return json;
    });
}

function* getProductLinks(catLists) {

  var nightmare = Nightmare(),
    gotoUrl = catLists,
    nextExists = true,
    allLinks = [];

  let scrapedData = yield nightmare
    .goto(gotoUrl)


  while (nextExists) {

    // loging scraping site url
    var url = yield nightmare
      .wait(4000)
      .url();
    console.log(url);

    yield nightmare
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.plp-list__item'),
          nextExists = document.querySelectorAll('.plp-pagination__nav:last-child')[0].classList.length == 1,
          tagsElemnts = document.querySelectorAll('.breadcrumb > li > a'),
          // tags = [],
          tags = document.querySelectorAll('.comp-breadcrumb__item:last-child')[0].innerText.trim();

        // going through each product
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('.comp-productcard__img')[0].title.trim(),
            "url": item.querySelectorAll(".comp-productcard__wrap > a")[0].href,
            "price": item.querySelectorAll('.comp-productcard__price')[0].innerText.trim(),
            "brand": tags,
            "site": "carrefouruae",
          });
        });

        // return all the values
        return {
          'links': links,
          'nextExists': nextExists
        };

      }).then(async function (resalt) {
        nextExists = resalt.nextExists;
        await saveToDb(resalt.links);
      })

    if (nextExists) {
      yield nightmare
      .click('.plp-pagination__nav:last-child a');

      var nextPageUrl = yield nightmare
      .evaluate(function () {
              return document.querySelectorAll('.plp-pagination__nav:last-child a')[0].href
            })

            yield nightmare.goto(nextPageUrl)
        // .wait(4000);
                // .evaluate(function () {
                //   document.querySelectorAll('.plp-pagination__nav:last-child')[0].click()
                // })
    }
  }

  yield nightmare.end();

}

function* saveToDb(params) {

  var jsonData = JSON.stringify(params);
  return yield fetch('https://sitedata-mum.herokuapp.com/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    })
    .then(res => res.json())
    .then(json => {
      console.log('data saved')
    });

}
