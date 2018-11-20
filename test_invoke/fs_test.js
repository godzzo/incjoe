
'use strict'

const fs = require('fs');

/*
    obj:
        parms - Parsed QueryString
        ctx - request context
        setting - config invoke setting
        config - main config
        results - mysql result array
 */

async function ReadText(obj) {
    if (obj.parms.fileName) {
        return fs.readFileSync(obj.parms.fileName);
    } else {
        return "";
    }
}

module.exports = {
    ReadText
};