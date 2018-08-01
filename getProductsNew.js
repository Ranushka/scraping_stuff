'use strict';

/** Get products all sites
 * loop through the files
 * located at ./lib/
 */
const getProdutsDir = `${__dirname}/jobs/getProducts/`;
const fs = require('fs');
const {
  spawn
} = require('child_process')
const logger = require('./logger');
const lib = require('./lib');

runEach();

async function runEach() {

  fs.readdir(getProdutsDir, async (err, files) => {

    /**
     * randamize the file list to change the order of rining */
    files = files.sort(async function (a, b) {
      return 0.5 - Math.random()
    });

    /**
     * Looping throuh the products */
    for (let file of files) {
      await runProductsComand(`${getProdutsDir + file}`)
    }

  });

  logger.info(`ALL Scripts are done`)

}


async function runProductsComand(url) {
  let p1 = promisfiedSpawn(url)
  var abc = await Promise.all([p1])
  return abc;
}

function promisfiedSpawn(url) {

  return new Promise((resolve) => {

    let fileName = url.split('/').pop();

    console.log(``)
    console.log(`Start ---- ${fileName}`)
    let t1 = new Date()

    let comand = spawn('node', [url])

    comand.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
    })

    comand.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
    })

    comand.on('exit', function (data) {
      let t2 = new Date()
      logger.info(`End ---- | ${ lib.convertMS(t2 - t1) } | ${fileName}`)
      console.log(`End ---- | ${ lib.convertMS(t2 - t1) } | ${fileName}`)
      resolve(data.toString());
    })

  });

};


process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection ----- ', error.message);
});
