'use strict';

const pm2 = require('pm2');
const Nightmare = require('nightmare');
const nightmare = Nightmare();
const fetch = require('node-fetch');
const crypto = require('crypto');

// xvfb.startSync();

// http://localhost:3789/api/links/remainScrapeLinksCount?site=mumzworld

var self = {
  nextExists: true,

  remainScrapeLinksCount: async function (siteName) {
    return await fetch(`https://sitedata-mum.herokuapp.com/api/links/remainScrapeLinksCount?site=${siteName}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
        return json;
      });
  },

  startPm2: async function (fileName) {
    pm2.connect(function (err) {
      if (err) {
        console.error(err)
        process.exit(2)
      }

      pm2.start({
        script: fileName,
        instances: 3,
        autorestart: false,
      }, (err, apps) => {
        pm2.disconnect()
        if (err) {
          throw err
        }
      })
    });
  },

  resetScrapeLinks: async function (siteName) {
    // TODO: need to do 
    // return;
    console.log(`resetScrapeLinks ${siteName}`);
    return await fetch(`https://sitedata-mum.herokuapp.com/api/links/resetScrapeLinks?site=${siteName}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
        return json;
      });
  },

  start: async function (siteName, getProduct, getLinks) {
    console.log('kicking off');

    let i = 0;
    let nextMainLink = true;

    self.nextExists = true;

    while (nextMainLink) {
      let link, urlToScrap;
      urlToScrap = await self.getNewScrapURL(siteName);

      if (urlToScrap.greeting) {
        console.log('nextMainLink --- ', nextMainLink)
        self.nextExists = true;
        await getProduct(urlToScrap.greeting.url, siteName);
      } else {
        nextMainLink = false;
      }
      i++;
    }

    console.log(`${siteName} All links ara scraped ${i}`);

    nightmare.end();
    pm2.killDaemon();
    process.exit(2);

  },

  PrepToSave: async function (result) {

    console.log('products_PrepToSave', result.length);

    var i, j = [],
      self = this,
      saveUrl = 'https://sitedata-mum.herokuapp.com/api/products',
      chunk = 100;

    // split data to save efactivly
    for (i = 0, j = result.length; i < j; i += chunk) {
      let data = result.slice(i, i + chunk)

      // save data if data avalable
      if (data) {

        // assign unic id for the product
        data.map(function (i, item) {
          const hash = crypto.createHash('sha256');
          hash.update(data[item]['url']);
          data[item]['uid'] = hash.digest('hex');
        })

        // stringify to save data
        var jsonData = JSON.stringify(data);

        // save data to db
        self.saveToDb(saveUrl, jsonData);
      }
    }
  },

  getNewScrapURL: async function (siteName) {
    return fetch(`https://sitedata-mum.herokuapp.com/api/links/nextScrapLink?site=${siteName}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
        return json;
      });
  },

  saveToDb: async function (saveUrl, jsonData) {
    console.log('saveToDb');

    // send data to save
    return fetch(saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: jsonData
      })
      .then(res => {
        return res.json();
      });
  }

};

module.exports = self;
