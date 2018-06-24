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

  resetScrapeLinks: async function (siteName) {
    // TODO: need to do 
    // return;
    console.log(`resetScrapeLinks ${siteName}`)
    return await fetch(`https://sitedata-mum.herokuapp.com/api/links/resetScrapeLinks?site=${siteName}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
        return json;
      });
  },

  start: async function (siteName, getProductLinks) {
    console.log('kicking off');

    var canGo = await this.remainScrapeLinksCount(siteName);

    if (!canGo.response) {
      await this.resetScrapeLinks(siteName);
    }

    console.log(canGo);
    
    let i = 0;
    let nextMainLink = true;

    self.nextExists = true;

    while (nextMainLink) {
      let link, urlToScrap;
      urlToScrap = await self.getNewScrapURL(siteName);
      
      if (urlToScrap.greeting) {
        console.log('nextMainLink --- ', nextMainLink)
        self.nextExists = true;
        await getProductLinks(urlToScrap.greeting.url, siteName);
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

  saveToDb: async function (data) {

    console.log('start save data');

    // assign unic id for the product
    if (data) {
      data.map(function (i, item) {
        const hash = crypto.createHash('sha256');
        hash.update(data[item]['url']);
        data[item]['uid'] = hash.digest('hex');
      })
    }
    // stringify to save data
    var jsonData = JSON.stringify(data);

    // send data to save
    return fetch('https://sitedata-mum.herokuapp.com/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: jsonData
      })
      .then(res => {
        return res.json();
      });
  },

  getNewScrapURL: async function (siteName) {
    return fetch(`https://sitedata-mum.herokuapp.com/api/links/nextScrapLink?site=${siteName}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
        return json;
      });
  }

};

module.exports = self;

