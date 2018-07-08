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

  console.time('sceapeAllStart');

  for (let file of files) {

    console.log(file);

    await runComand(getProdutsDir, file);

    await console.log('file done - ', file)

  }

  console.timeEnd('sceapeAllEnd');

})


async function runComand(getProdutsDir, file) {
  let cmnd = `node ${getProdutsDir+file}`;
  // let cmnd = `pm2 start ${getProdutsDir+file} --no-autorestart -i 3`;

  let siteName = file.split('_')[0];

  console.log('siteName - ', siteName)
  await lib.resetScrapeLinks(siteName);

  // await exec(cmnd);

  let task1 = async () => exec(cmnd);
  let task2 = async () => exec(cmnd);
  let task3 = async () => exec(cmnd);

  await Promise.all([
    task1(), task2(), task3()
  ]);

}


process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection ----- ', error.message);
});







// /** Get products all sites
//  * loop through the files
//  * located at ./lib/
//  */
// fs.readdir(getProdutsDir, async (err, files) => {

//   for (let file of files) {
//     console.log(file)
//     let cmnd = `pm2 start ${getProdutsDir+file} --no-autorestart -i 3`;
//     // let cmnd = `${getProdutsDir+file}`;
//     console.log(cmnd);

//     /** Reset the links befor start
//      * get the site name by spliting file name by "_"
//      */
//     let siteName = file.split('_')[0];

//     await lib.resetScrapeLinks(siteName);

//     /** Run the command */
//     // await lib.startPm2(cmnd);
//     await exec(cmnd);

//   }

// })
