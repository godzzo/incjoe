/*
 */

'use strict'

const ejs = require('ejs');

const people = ['geddy', 'neil', 'alex'];

const html = ejs.render('<%= people.join(", "); %>', {people: people});

console.log(html);
