'use strict';


const getProdutsDir = `${__dirname}/jobs/getProducts/`;
const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);



async function ls(cmnd) {
  await exec(cmnd);
}

// get products all sites
fs.readdir(getProdutsDir, async (err, files) => {

  for (let file of files) {
    console.log(file)
    var cmnd = `pm2 start ${getProdutsDir+file} --no-autorestart -i 3`;
    console.log(cmnd);
    await ls(cmnd);
  }

})