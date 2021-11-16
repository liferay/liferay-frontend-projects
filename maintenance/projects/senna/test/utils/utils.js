/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

import Uri from 'metal-uri';

import globals from '../../src/globals/globals';
import utils from '../../src/utils/utils';

describe('utils', () => {
	before(() => {
		globals.window = {
			location: {
				hostname: 'hostname',
				pathname: '/path',
				search: '?a=1',
				hash: '#hash',
			},
			history: {
				pushState: 1,
			},
		};
	});

	after(() => {
		globals.window = window;
	});

	it('copies attributes from source node to target node', () => {
		var nodeA = document.createElement('div');

		nodeA.setAttribute('a', 'valueA');
		nodeA.setAttribute('b', 'valueB');

		var nodeB = document.createElement('div');

		utils.copyNodeAttributes(nodeA, nodeB);

		assert.strictEqual(nodeA.attributes.length, nodeB.attributes.length);
		assert.strictEqual(nodeA.getAttribute('a'), nodeB.getAttribute('a'));
		assert.strictEqual(nodeA.getAttribute('b'), nodeB.getAttribute('b'));
		assert.strictEqual(nodeB.getAttribute('a'), 'valueA');
		assert.strictEqual(nodeB.getAttribute('b'), 'valueB');
	});

	it('clears attributes from a given node', () => {
		var node = document.createElement('div');

		node.setAttribute('a', 'valueA');
		node.setAttribute('b', 'valueB');

		utils.clearNodeAttributes(node);

		assert.strictEqual(node.getAttribute('a'), null);
		assert.strictEqual(node.getAttribute('b'), null);
		assert.strictEqual(node.attributes.length, 0);
	});

	it('gets path from url', () => {
		assert.strictEqual(
			'/path?a=1#hash',
			utils.getUrlPath('http://hostname/path?a=1#hash')
		);
	});

	it('gets path from url excluding hashbang', () => {
		assert.strictEqual(
			'/path?a=1',
			utils.getUrlPathWithoutHash('http://hostname/path?a=1#hash')
		);
	});

	it('gets path from url excluding hashbang and search', () => {
		assert.strictEqual(
			'/path',
			utils.getUrlPathWithoutHashAndSearch(
				'http://hostname/path?a=1#hash'
			)
		);
	});

	it('tests if path is current browser path', () => {
		assert.ok(utils.isCurrentBrowserPath('http://hostname/path?a=1'));
		assert.ok(utils.isCurrentBrowserPath('http://hostname/path?a=1#hash'));
		assert.ok(!utils.isCurrentBrowserPath('http://hostname/path1?a=1'));
		assert.ok(
			!utils.isCurrentBrowserPath('http://hostname/path1?a=1#hash')
		);
		assert.ok(!utils.isCurrentBrowserPath());
	});

	it('gets current browser path', () => {
		assert.strictEqual('/path?a=1#hash', utils.getCurrentBrowserPath());
	});

	it('gets current browser path excluding hashbang', () => {
		assert.strictEqual(
			'/path?a=1',
			utils.getCurrentBrowserPathWithoutHash()
		);
	});

	it('tests if Html5 history is supported', () => {
		assert.ok(utils.isHtml5HistorySupported());
		globals.window.history = null;
		assert.ok(!utils.isHtml5HistorySupported());
	});

	it('tests if a given url is a valid web (http/https) uri', () => {
		assert.ok(
			!utils.isWebUri('tel:+999999999'),
			'tel:+999999999 is not a valid url'
		);
		assert.instanceOf(utils.isWebUri('http://localhost:12345'), Uri);
	});
});
