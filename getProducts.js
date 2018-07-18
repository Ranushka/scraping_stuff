'use strict';

/** Get products all sites
 * loop through the files
 * located at ./lib/
 */
const getProdutsDir = `${__dirname}/jobs/getProducts/`;
const fs = require('fs');
const { spawn } = require('child_process')

runEach();

async function runEach() {

  fs.readdir(getProdutsDir, async (err, files) => {
    console.time('sceapeAllTime');
    for (let file of files) {
      console.log(`start script ${file}`)
      await runProductsComand(`${getProdutsDir + file}`)
      console.log(`end script ${file}`)
    }
    console.timeEnd('sceapeAllTime');
  });

  console.log('ALL Scripts are done');

}

async function runProductsComand(url) {

  var abc = await Promise.all([
    promisfiedSpawn(url),
    promisfiedSpawn(url),
    promisfiedSpawn(url),
    promisfiedSpawn(url)
  ])

  return abc;

}

function promisfiedSpawn(url) {

  return new Promise((resolve, reject) => {

    console.log(`start ---- ${url}`)

    let comand = spawn('node', [url])

    comand.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
    })

    comand.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
    })

    comand.on('exit', function (data) {
      console.log('child process exited with code ' + data.toString());
      resolve(data.toString());
    })

  });

};


process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection ----- ', error.message);
});
