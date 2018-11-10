/*
 */

'use strict'

var fs = require('fs');

const jsdom = require('jsdom');

const dom = ParseDOM('./learn_jquery.html');

const $ = require('jquery')(dom.window);

$('.list-group-item').each( (idx, el) => console.log( $(el).text() ) );

$('#write-content').html(`
    <ul>
        <li>Do Smoke!</li>
        <li>Write Something...</li>
    </ul>
`);

const text = dom.serialize();

fs.writeFileSync('./learn_jquery.out.html', text);

function ParseDOM(filePath) {
    const { JSDOM } = jsdom;

    const data = fs.readFileSync(filePath);

    const dom = new JSDOM(data);

    return dom;
}
