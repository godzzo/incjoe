/*
 */

'use strict'

const fs = require('fs');

const LoadFile = require('./util_common.js').LoadFile;

const inPath = process.argv[2];
const outPath = process.argv[3];

const full = LoadFile(inPath);

console.log(full);

console.log('outPath', outPath);

fs.writeFileSync(outPath, full);
