'use strict'

const db = require('../util_mysql.js');

/*
    obj:
        parms - Parsed QueryString
        ctx - request context
        setting - config invoke setting
        config - main config
        results - mysql result array

    obj.setting
    - formatModule - module of result formatter function
    - formatAction - function name of result formatter
    - stringify    - we have to do the json result
 */
async function FormatSqlToChange (obj) {
    for (const el of obj.results) {
        el['adv_id'] = el['adv_id'] + ' CHANGED SECOND...';
    }
}

module.exports = {
    FormatSqlToChange
};