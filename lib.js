'use strict';

const pm2 = require('pm2');
const Nightmare = require('nightmare');
const nightmare = Nightmare();
const fetch = require('node-fetch');
const crypto = require('crypto');
const logger = require('./logger');

// xvfb.startSync();

var self = {
  nextExists: true,
  waitTime: 4000,
  APIbaseUrl: "http://rd0sobnyof.nlnode.webrahost.eu",
  // APIbaseUrl: "http://localhost:3789",

  remainScrapeLinksCount: async function (siteName) {
    return await fetch(`${lib.APIbaseUrl}/api/links/remainScrapeLinksCount?site=${siteName}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
        return json;
      });
  },

  startPm2: async function (fileName) {
    // pm2.connect(function (err) {
    //   if (err) {
    //     console.error(err)
    //     process.exit(2)
    //   }

    //   pm2.start({
    //     script: fileName,
    //     instances: 3,
    //     autorestart: false,
    //   }, (err, apps) => {
    //     pm2.disconnect()
    //     if (err) {
    //       throw err
    //     }
    //   })
    // });
  },

  resetScrapeLinks: async function (siteName) {
    return await fetch(`${this.APIbaseUrl}/api/links/resetScrapeLinks?site=${siteName}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
        console.log(`resetedScrapeLinks - ${siteName} - ${json.greeting.ok}`);
        return json;
      });
  },

  start: async function (siteName, getProduct, getLinks) {
    console.log('kicking off');

    let i = 0;

    while (self.nextExists) {
      let urlToScrap = await self.getNewScrapURL(siteName);

      if (urlToScrap.greeting) {
        console.log('self.nextExists --- ', self.nextExists);
        await getProduct(urlToScrap.greeting.url, siteName);
      } else {
        self.nextExists = false;
      }
      i++;
    }

    console.log(`${siteName} All links ara scraped ${i}`);

    // nightmare.end();
    // pm2.killDaemon();
    process.exit(2);

  },

  getNewScrapURL: async function (siteName) {
    console.log('getNewScrapURL for - ', siteName);
    return fetch(`${this.APIbaseUrl}/api/links/nextScrapLink?site=${siteName}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(json => {
        return json;
      })
      .catch(error => {
        logger.log('error', `get_new_scrape_url | ${error}`)
        console.error('getNewScrapURL error - ', error)
      })
  },

  PrepToSave: async function (result, apiUrlTosave, urlToScrape) {

    console.log('PrepToSave', result.length, 'items');

    var i, j = [],
      self = this,
      saveUrl = apiUrlTosave,
      chunk = 100;

      if (result.length) {
         // split data to save efactivly
         for (i = 0, j = result.length; i < j; i += chunk) {
           let data = result.slice(i, i + chunk)

           // save data if data avalable
           if (data) {

             // assign unic id for the product
             data.map(function (i, item) {
               const hash = crypto.createHash('sha256');
               hash.update(data[item]['url']);
               data[item]['id'] = hash.digest('hex');
             })

             /** API endpoint Acsepted data format is 
              * { dataObject: dataArray }
              */
             data = {
               dataObject: data
             };

             // stringify to save data
             var jsonData = JSON.stringify(data);

             // save data to db
             await self.saveToDb(saveUrl, jsonData);
           }
         }
      } else {
        logger.log('error', `no_url_to_save | ${urlToScrape}`)
        console.error('No Urls to save', urlToScrape);
      }
   
  },

  saveToDb: async function (saveUrl, jsonData) {
    await console.log('Save data Start');

    // send data to save
    await fetch(saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: jsonData
      })
      .catch(function (error) {
        logger.log('error', `db_save_fail | ${urlToScrape}`)
        console.error(`Error - ${saveUrl} :`, error);
      });

    await console.log('Save data Done');
    
  }

};

module.exports = self;
