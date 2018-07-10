'use strict';


const getProdutsDir = `${__dirname}/jobs/getProducts/`;
const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
  let cmnd = `node ${getProdutsDir+file}`;
  // let cmnd = `pm2 start ${getProdutsDir+file} --no-autorestart -i 3`;

  let siteName = file.split('_')[0];

  await lib.resetScrapeLinks(siteName);

  /** run multipal tasks
   * exec( cmnd, {maxBuffer: 1024 * 500} );
   */
  let task1 = async () => exec(cmnd, {maxBuffer: 1024 * 1000});
  let task2 = async () => exec(cmnd, {maxBuffer: 1024 * 1000});
  let task3 = async () => exec(cmnd, {maxBuffer: 1024 * 1000});

  await Promise.all([
    task1(), task2(), task3()
  ]);

}


process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection ----- ', error.message);
});





