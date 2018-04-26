import {negate, prefix} from '../globs';

it('negate works', () => {
	let globs = ['**/*', '!index.js'];

	expect(negate(globs)).toEqual(['!**/*', 'index.js']);
});

it('prefix works', () => {
	let globs = ['**/*', '!index.js'];

	expect(prefix('dir/', globs)).toEqual(['dir/**/*', '!dir/index.js']);
});
