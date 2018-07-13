'use strict';


const getProdutsDir = `${__dirname}/jobs/getProducts/`;
const fs = require('fs');

const {
  spawn
} = require('child_process');

const lib = require('./lib');


/** Get products all sites
 * loop through the files
 * located at ./lib/
 */
fs.readdir(getProdutsDir, async (err, files) => {

  console.time('sceapeAllTime');

  for (let file of files) {

    console.log(file);

    await runComand(getProdutsDir, file);

    await console.log('file done - ', file)

  }

  console.timeEnd('sceapeAllTime');

})


async function runComand(getProdutsDir, file) {

  let siteName = file.split('_')[0];

  // await lib.resetScrapeLinks(siteName);

  const T1 = spawn('node', [getProdutsDir + file]).stdout.on('data', (data) => {
    console.log(data.toString());
  });


  const T2 = spawn('node', [getProdutsDir + file]).stdout.on('data', (data) => {
    console.log(data.toString());
  });

  const T3 = spawn('node', [getProdutsDir + file]).stdout.on('data', (data) => {
    console.log(data.toString());
  });

  const T4 = spawn('node', [getProdutsDir + file]).stdout.on('data', (data) => {
    console.log(data.toString());
  });

  await Promise.all([
    T1, T2, T3, T4
  ]);

}


process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection ----- ', error.message);
});
