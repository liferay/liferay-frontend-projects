/* eslint-disable */

const fileJson = require('./file.json');
require('./style/red-border.css');
require('./css/green-border.css');
require('./blue-border.css');

function main(params) {
	var node = document.getElementById(params.portletElementId);

	node.innerHTML =
		'<div>' +
		'<span class="tag">' +
		'JSON file:' +
		'</span>' +
		'<pre>' +
		JSON.stringify(fileJson, null, 2) +
		'</pre>' +
		'</div>' +
		'<div class="red-border">A red border div (from style-loader)</div>' +
		'<div class="green-border">A green border div (from css-loader)</div>' +
		'<div class="blue-border">A blue border div (from sass-loader)</div>';
}

module.exports = main;
