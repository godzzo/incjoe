
'use strict'

const mysql = require('mysql');
const util = require('util');

function OpenConnection(config) {
    const connection = mysql.createConnection(config);

    connection.on('error', function (err) {
        console.log('onerror, caught mysql connection error: ' + err.toString());
    });

    connection.connect( (err) => {
        if (err) {
            console.error('callback, error connecting: ' + err.stack);

            return;
        }

        console.log('connected as id ' + connection.threadId);
    });

    connection.config.queryFormat = NamedParmsQueryFormat;

    return connection;
}

function GenerateInsert(table, data) {
    const names = [];
    const parms = [];

    Object.keys(data).forEach( (key) => {
        names.push(key);
        parms.push(":"+key);
    } );

    const insertSql = `INSERT INTO ${table} (${names.join(',')}) VALUES (${parms.join(',')});`;

    return insertSql;
}

function GenerateUpdate(table, data, primaryKey) {
    const parms = [];

    Object.keys(data).forEach( (key) => {
        if (key != primaryKey) {
            parms.push(`${key} = :${key}`);
        }
    } );

    const updateSql = `UPDATE ${table} SET ${parms.join(',')} WHERE ${primaryKey} = :${primaryKey} ;`;

    return updateSql;
}


function RunQuery(config, sql, parms, cb) {
    const connection = OpenConnection(config);

    connection.query(sql, parms, (error, result, fields) => {
        console.log( JSON.stringify( result ) );
        cb(results);

        connection.destroy();
    });
}

async function RunQueryAsync(config, sql, parms) {
	try {
		const connection = OpenConnection(config);
		connection.query = util.promisify(connection.query);

		const results = await connection.query(sql, parms);

		//console.log( JSON.stringify( {results} ) );

		console.log( 'SQL', sql );
		console.log( 'PARMS', JSON.stringify( parms ) );

		connection.destroy();

		return results;
	} catch (e) {
		throw e;
	}
}

async function InsertAsync(config, table, parms) {
    const sql = GenerateInsert(table, parms);

    return await RunQueryAsync(config, sql, parms);
}

async function UpdateAsync(config, table, parms, primaryKey) {
    const sql = GenerateUpdate(table, parms, primaryKey);

    return await RunQueryAsync(config, sql, parms);
}

// By https://github.com/mysqljs/mysql#custom-format
function NamedParmsQueryFormat (query, values) {
    if (!values) return query;

    return query.replace(/\:(\w+)/g, function (txt, key) {

        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }

        return txt;
    }.bind(this));
}

module.exports = {
    open: OpenConnection,
    query: RunQuery,
    queryAsync: RunQueryAsync,
    insertAsync: InsertAsync,
    updateAsync: UpdateAsync
};
