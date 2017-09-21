import * as babel from 'babel-core';
import plugin from '../index';

it('correctly namespaces unqualified define calls', () => {
  const source = `
	define([], function(){})
	`;

  const {code} = babel.transform(source, {
    plugins: [plugin],
  });

  expect(code).toMatchSnapshot();
});

it('does not namespace already qualified define calls', () => {
  const source = `
	Other.Namespace.define([], function(){})
	`;

  const {code} = babel.transform(source, {
    plugins: [plugin],
  });

  expect(code).toMatchSnapshot();
});

// It is not clear what would be the best way to handle multiple define calls in
// the code.
// On the one hand, it is faster to only change the first appearance as 99% of
// the time we will be processing AMD modules with define calls issued by us.
// On the other hand, some third party modules (like jQuery, for instance) issue
// define() calls inside their code. We expect only one such call, but if
// someone does anything more exotic than that, this plugin could "fail".
it('only namespaces the first appearance of define() in the source', () => {
  const source = `
	if(window.define) {
		define([], function() {
			console.log(define('this should not be namespaced'));
		});
	}
	define('this should not be namespaced')
	`;

  const {code} = babel.transform(source, {
    plugins: [plugin],
  });

  expect(code).toMatchSnapshot();
});
