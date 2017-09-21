import * as babel from 'babel-core';
import plugin from '../index';

it('correctly names anonymous modules', () => {
  const source = `
	define([], function(){})
	`;

  const {code} = babel.transform(source, {
    filenameRelative: __filename,
    plugins: [plugin],
  });

  expect(code).toMatchSnapshot();
});

it('correctly renames named modules', () => {
  const source = `
	define('my-invalid-name', [], function(){})
	`;

  const {code} = babel.transform(source, {
    filenameRelative: __filename,
    plugins: [plugin],
  });

  expect(code).toMatchSnapshot();
});
