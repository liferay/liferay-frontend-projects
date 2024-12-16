// "fs": false,
// "./util": false,
// "./model/index.js": false

module.exports = () => {
	console.log(`require('fs')`, require('fs'));
	console.log(`require('./util')`, require('./util'));
	console.log(`require('./model/index.js')`, require('./model/index.js'));
};
