/*
 */

'use strict'

const fs = require('fs');

const LoadFile = require('./util_common.js').LoadFile;
const ParseInclude = require('./util_common.js').ParseInclude;
const LateParse = require('./util_common.js').LateParse;

const inPath = process.argv[2];
const outPath = process.argv[3];

let full = LoadFile(inPath, undefined, ParseInclude, 'include');

full = LateParse(full);

console.log(full);

console.log('outPath', outPath);

fs.writeFileSync(outPath, full);
