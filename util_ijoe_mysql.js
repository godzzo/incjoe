'use strict'

const db = require('./util_mysql.js');

/*
    parms - Parsed QueryString
    ctx - request context
    setting - config invoke setting
    config - main config

    extra settings
    - formatModule - module of result formatter function
    - formatAction - function name of result formatter
    - stringify    - we have to do the json result
 */
async function RunSql (parms, ctx, setting, config) {
    const sql = eval('`' + setting.sql + '`');

    let results = await db.queryAsync(config.db, sql, parms);

    if (setting.formatModule && setting.formatAction) {
        const mdl = require(setting.formatModule);

        console.log(`BEFORE: RunSql format ${setting.formatModule} / ${setting.formatAction}`, results);

        results = await mdl[setting.formatAction](parms, ctx, setting, config, results);

        console.log(`AFTER: RunSql format ${setting.formatModule} / ${setting.formatAction}`, results);
    }

    if (setting.notStringify) {
        return results;
    } else {
        return JSON.stringify(results);
    }
}

module.exports = {
    RunSql
};