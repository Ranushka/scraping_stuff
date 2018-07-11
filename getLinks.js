'use strict';

const getProdutsDir = `${__dirname}/jobs/getLinks/`;
const fs = require('fs');
const {
  spawn
} = require('child_process');

/** 
 * Get links from all sites
 * loop through the files
 * located at. /lib/jobs/getLinks/
 */
fs.readdir(getProdutsDir, async (err, files) => {
  console.time('Time_for_links');
  for (let file of files) {

    await runComand(getProdutsDir, file);
    await console.log(file)
  }
  console.timeEnd('Time_for_links');
});

async function runComand(getProdutsDir, file) {
  spawn('node', [getProdutsDir + file]).stdout.on('data', (data) => {
    console.log(data.toString());
  });
}