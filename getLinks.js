'use strict';


const getProdutsDir = `${__dirname}/jobs/getLinks/`;
const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const lib = require('./lib');

const pm2 = require('pm2');

const numCPUs = require('os').cpus().length


/** 
 * Get links from all sites
 * loop through the files
 * located at. /lib/jobs/getLinks/
 */
fs.readdir(getProdutsDir, async (err, files) => {

  for (let file of files) {
    console.log(file)
    let cmnd = `pm2 start ${getProdutsDir+file} --no-autorestart`;
    await exec(cmnd);
  }

})

    // let cmnd = `${getProdutsDir+file}`;
    // console.log(cmnd);

    // idMaker(cmnd);

    /** Run the command */
    // await lib.startPm2(cmnd);

    // var status = await exec(`pm2 prettylist`);
    // var stsatus = await eval(status.stdout);
    // await idMaker(stsatus);
    // console.log(stsatus);



// function idMaker(stsatus) {

//   sleep(1000);
//   var count = 0;
//   stsatus.map(function (item) {
//     item.pid > 0 ? count++ : 0;
//     console.log(item.pid);
//   })
//   // yield exec(cmnd);
//   // var status = await exec(`pm2 prettylist`);
//   // var stsatus = await eval(status.stdout);
// }

// function sleep(milliseconds) {
//   var start = new Date().getTime();
//   for (var i = 0; i < 1e7; i++) {
//     if ((new Date().getTime() - start) > milliseconds) {
//       break;
//     }
//   }
// }