'use strict';


const getProdutsDir = `${__dirname}/jobs/getLinks/`;
const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const lib = require('./lib');


/** 
 * Get links from all sites
 * loop through the files
 * located at. /lib/jobs/getLinks/
 */
fs.readdir(getProdutsDir, async (err, files) => {

  for (let file of files) {
    console.log(file)
    let cmnd = `pm2 start ${getProdutsDir+file} --no-autorestart`;
    // let cmnd = `${getProdutsDir+file}`;
    console.log(cmnd);

    /** Run the command */
    // await lib.startPm2(cmnd);
    await exec(cmnd);

  }

})



