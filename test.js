'use strict';


const testFolder = `${__dirname}/jobs/`;
const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);



async function ls(cmnd) {
  await exec(cmnd);
}

fs.readdir(testFolder, async (err, files) => {

  for (let index of files) {
    console.log(index)
    var cmnd = `pm2 start ${testFolder+index} --no-autorestart -i 3`;
    console.log(cmnd);
    await ls(cmnd);
  }

})