/*
 */

'use strict'

const DomParser = require('dom-parser');
const parser = new DomParser();

const dom = parser.parseFromString(`<include src="t_header.html" data="t_header_search.json" parms="name:Hello;type:NORMAL;age:23"></include>`);

const el = dom.getElementsByTagName('include')[0];

const data = el.getAttribute("data");
const src = el.getAttribute("src");
const parms = el.getAttribute("parms");

console.log('parsed', {data, src, parms});
