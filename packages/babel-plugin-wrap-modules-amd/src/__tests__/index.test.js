import * as babel from 'babel-core';
import plugin from '../index';

it('correctly wraps modules', () => {
  const source = `
	console.log('Say something');
	if (1 == 0) {
		console.log('Something broke in the Matrix');
	}
	module.exports = 'All OK';
	`;

  const {code} = babel.transform(source, {
    plugins: [plugin],
  });

  expect(code).toMatchSnapshot();
});
