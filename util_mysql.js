
'use strict'

const mysql = require('mysql');
const util = require('util');

function OpenConnection(config) {
    const connection = mysql.createConnection(config);

    connection.connect();

    connection.config.queryFormat = NamedParmsQueryFormat;

    return connection;
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
    const connection = OpenConnection(config);

    console.log( 'SQL', sql );
    console.log( 'PARMS', JSON.stringify( parms ) );

    connection.query = util.promisify(connection.query);

    const results = await connection.query(sql, parms);

    console.log( JSON.stringify( {results} ) );

    connection.destroy();

    return results;
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
    queryAsync: RunQueryAsync
};
