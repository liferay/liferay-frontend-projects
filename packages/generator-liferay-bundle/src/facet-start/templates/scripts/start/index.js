var main = require('../src/index.js');

var params = {
	portletElementId: 'the-portlet',
	contextPath: '/',
	portletNamespace: '_the-portlet_',
};

if (main.default) {
	main = main.default;
}

main(params);