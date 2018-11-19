
'use strict'

const fs = require('fs');

async function ReadText(parms, ctx, setting) {
    if (parms.fileName) {
        return fs.readFileSync(parms.fileName);
    } else {
        return "";
    }
}

module.exports = {
    ReadText
};