/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const dedent = require('../../src/format/dedent');

describe('dedent()', () => {
	// TODO: test/handle tabs
	it('dedents based on the smallest existing indent', () => {
		expect(dedent('  def foo\n    1\n  end')).toBe('def foo\n  1\nend');
	});
});
