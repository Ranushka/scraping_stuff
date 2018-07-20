'use strict';

/** Get products all sites
 * loop through the files
 * located at ./lib/
 */
const getProdutsDir = `${__dirname}/jobs/getProducts/`;
const fs = require('fs');
const { spawn } = require('child_process')
const logger = require('./logger');

runEach();

async function runEach() {

  fs.readdir(getProdutsDir, async (err, files) => {
    console.time('sceapeAllTime');
    for (let file of files) {
      logger.info(`start script ${file}`)
      await runProductsComand(`${getProdutsDir + file}`)
      logger.info(`end script ${file}`)
    }
    console.timeEnd('sceapeAllTime');
  });

  logger.info(`ALL Scripts are done`)

}

async function runProductsComand(url) {

      let p1 = promisfiedSpawn(url)
      let p2 = promisfiedSpawn(url)
      let p3 = promisfiedSpawn(url)
      let p4 = promisfiedSpawn(url)

  var abc = await Promise.all([p1, p2, p3, p4])

  return abc;

}

function promisfiedSpawn(url) {

  return new Promise((resolve) => {

    console.log(`start ---- ${url}`)

    let comand = spawn('node', [url])

    comand.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
    })

    comand.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
    })

    comand.on('exit', function (data) {
      console.log(`child process exited with code | ${data.toString()} | ${url}`);
      resolve(data.toString());
    })

  });

};


process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection ----- ', error.message);
});
