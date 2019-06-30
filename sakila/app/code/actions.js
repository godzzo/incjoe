'use strict'

/*
    obj:
        parms - Parsed QueryString
        ctx - request context
        setting - config invoke setting
        config - main config
        results - mysql result array
 */

async function TestFilter(obj) {
	if (!obj.parms.please) {
		obj.data.templatePath = obj.data.templateRoot + 'tp_denied.html';
	}

	console.log('TestFilter',  JSON.stringify({msg: 'Test', name: 'filter', obj}, null, 4));
}

module.exports = {
    TestFilter
};
