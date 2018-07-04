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

  for (let file of files) {
    console.log(file)
    let cmnd = `pm2 start ${getProdutsDir+file} --no-autorestart -i 3`;
    // let cmnd = `${getProdutsDir+file}`;
    console.log(cmnd);

    /** Reset the links befor start
     * get the site name by spliting file name by "_"
     */
    let siteName = file.split('_')[0];
    await lib.resetScrapeLinks(siteName);

    /** Run the command */
    // await lib.startPm2(cmnd);
    await exec(cmnd);

  }

})



