'use strict'

const db = require('./util_mysql.js');
const CallAction = require('./util_common.js').CallAction;

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
async function RunSql (obj) {
    const sql = eval('`' + obj.setting.sql + '`');

    obj.results = await db.queryAsync(obj.config.db, sql, obj.parms);

    console.log(`BEFORE: RunSql format results`, obj);
    await CallAction(obj.setting.formatModule, obj.setting.formatAction, obj);
    console.log(`AFTER: RunSql format results`, obj);

    if (obj.setting.notStringify) {
        return obj.results;
    } else {
        return JSON.stringify(obj.results);
    }
}

function pInt(value, defValue) {
	let intVal = parseInt(value);

	if (isNaN(intVal)) {
		intVal = defValue;
	}

	return intVal;
}

module.exports = {
    RunSql
};