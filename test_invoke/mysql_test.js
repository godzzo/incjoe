'use strict'

const db = require('../util_mysql.js');

/*
    parms - Parsed QueryString
    ctx - request context
    setting - config invoke setting
    config - main config
    results - mysql result array

    extra settings
    - formatModule - module of result formatter function
    - formatAction - function name of result formatter
    - stringify    - we have to do the json result
 */
async function FormatSqlToChange (parms, ctx, setting, config, results) {
    for (const el of results) {
        el['adv_id'] = el['adv_id'] + ' CHANGED';
    }

    return results;
}

module.exports = {
    FormatSqlToChange
};