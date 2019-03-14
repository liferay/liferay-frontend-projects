var sinon = require('sinon');

var spy = sinon.spy();

module.exports = function() {
	spy.apply(this, arguments);

	return spy;
};
