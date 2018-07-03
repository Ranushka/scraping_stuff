'use strict';

const Nightmare = require('nightmare');
const fetch = require('node-fetch');
const vo = require('vo');
const lib = require('../../lib');


console.log(`get main links start`);

var aaa = [
  "http://www.mumzworld.com/en/"
];

vo(start)(function (err, result) {
  if (err) throw err;
});

function* start() {
  var i = 0;
  while (i < aaa.length) {
    yield getMultipalSoursLinks(aaa[i])
    i++
  }
}

async function getMultipalSoursLinks(params) {
  console.log('get main links', params)
  var nightmare = Nightmare();

  await nightmare
    .goto(`${params}`)
    .wait(2000)
    .evaluate(function () {
      // get only baby prducts
      // var brandPageList = document.querySelectorAll('.brands a.box');
      var brandPageList = document.querySelectorAll('#custommenu h2.level2title a'),
          brandPageLinks = [];


      brandPageList.forEach(function (item) {

        brandPageLinks.push({
          "name": item.innerText.trim(),
          "url": item.href,
          "site": "mumzworld",
          "scrap": false
        });

      });
      return brandPageLinks;
    })
    .then(async function (result) {
      await lib.PrepToSave(result, `${lib.APIbaseUrl}/api/links`);
    })
    .catch(function (error) {
      console.error('Error:', error);
    });

}

// function* prepToSave(catLists) {
//   var i, j, temparray = [],
//     chunk = 100;
//   for (i = 0, j = catLists.length; i < j; i += chunk) {
//     yield saveToDb(catLists.slice(i, i + chunk));
//   }
// }

// function* saveToDb(params) {
//   console.log(params)
//   return yield fetch(`${lib.APIbaseUrl}/api/links`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(params)
//     })
//     .then(res => res.json())
//     .then(json => {
//       console.log(json)
//     });
// }