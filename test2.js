'use strict';


const fetch = require('node-fetch');
var abc = ['https://api.github.com/repos/jasonrudolph/keyboard', 'https://api.github.com/repos/zeit/next.js', 'https://api.github.com/repos/vuejs/vue'];

abc.forEach(async (ab) => {
  var urls = await oneByone(ab);

  if (urls.length) {
    oneByTwo.forEach(async (item) => {
      if (item.length) {
        var oneByTwo = await oneByTwo(item);
        console.log('count - ', oneByTwo);
      }
    })
  }

})

async function oneByone(params) {
  const res = await fetch(params);
  const json = await res.json();
  console.log('start - ', json.stargazers_count);
  return [json.stargazers_url, json.subscribers_url, json.tags_url];
}

async function oneByTwo(params) {
  const res = await fetch(params);
  const json = await res.json();
  return json.length;
}