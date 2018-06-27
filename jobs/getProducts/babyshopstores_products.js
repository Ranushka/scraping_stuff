'use strict';

const Xvfb = require('xvfb');
const Nightmare = require('nightmare');
const fetch = require('node-fetch');
const vo = require('vo');
const pm2 = require('pm2');

const xvfb = new Xvfb({
  silent: true
});

const nightmare = Nightmare({
  show: false
});

xvfb.startSync();

const siteName = "babyshopstores";

var nextExists = true;

vo(start)(function (err, result) {
  if (err) throw err;
});

function* start() {

  let i = 0;
  let nextMainLink = true;

  console.log('kicking off');

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
    var url = yield nightmare.url();
    console.log(url);

    yield nightmare
      .wait(4000)
      .evaluate(function () {

        var links = [],
          productList = document.querySelectorAll('.product-item'),
          nextExists = document.querySelectorAll('[class="next"]').length ? true : false,
          tagsElemnts = document.querySelectorAll('.breadcrumb > li > a'),
          tags = [];

        // get tags for the product
        tagsElemnts.forEach(function (a) {
          tags.push(a.innerText)
        });

        // going through each product
        productList.forEach(function (item) {
          links.push({
            "name": item.querySelectorAll('[itemprop="name"]')[0].innerText.trim(),
            "url": item.querySelectorAll(".product-link")[0].href,
            "price": item.querySelectorAll('[itemprop="price"]')[0].innerText.trim(),
            "brand": tags,
            "site": "babyshopstores",
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
        .click('.next')
        .wait(2000)
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
