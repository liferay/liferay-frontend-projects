/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

import dom from 'metal-dom';
import CancellablePromise from 'metal-promise';

import Screen from '../../src/screen/Screen';
import Surface from '../../src/surface/Surface';

describe('Screen', () => {
	before(() => {

		// Prevent log messages from showing up in test output.

		sinon.stub(console, 'log');
	});

	after(() => {
		console.log.restore();
	});

	it('exposes lifecycle activate', () => {
		assert.doesNotThrow(() => {
			new Screen().activate();
		});
	});

	it('exposes lifecycle deactivate', () => {
		assert.doesNotThrow(() => {
			new Screen().deactivate();
		});
	});

	it('exposes lifecycle beforeActivate', () => {
		assert.doesNotThrow(() => {
			new Screen().beforeActivate();
		});
	});

	it('exposes lifecycle beforeDeactivate', () => {
		assert.doesNotThrow(() => {
			new Screen().beforeDeactivate();
		});
	});

	it('exposes lifecycle load', () => {
		assert.doesNotThrow(() => {
			new Screen().load();
		});
	});

	it('exposes lifecycle getSurfaceContent', () => {
		assert.doesNotThrow(() => {
			new Screen().getSurfaceContent();
		});
	});

	it('exposes lifecycle dispose', () => {
		assert.doesNotThrow(() => {
			new Screen().dispose();
		});
	});

	it('exposes lifecycle flip', () => {
		assert.doesNotThrow(() => {
			new Screen().flip({});
		});
	});

	it('waits to flip all surfaces', (done) => {
		var surfaces = {
			surface1: new Surface('surface1'),
			surface2: new Surface('surface2'),
		};
		var stub1 = sinon.stub();
		var stub2 = sinon.stub();
		surfaces.surface1.show = () => {
			stub1();

			return CancellablePromise.resolve();
		};
		surfaces.surface2.show = () => {
			stub2();

			return CancellablePromise.resolve();
		};
		new Screen().flip(surfaces).then(() => {
			assert.strictEqual(1, stub1.callCount);
			assert.strictEqual(1, stub2.callCount);
			done();
		});
	});

	it('gets screen id', () => {
		var screen = new Screen();

		assert.ok(screen.getId());
		screen.setId('otherId');
		assert.strictEqual('otherId', screen.getId());
	});

	it('gets screen title', () => {
		var screen = new Screen();

		assert.strictEqual(null, screen.getTitle());
		screen.setTitle('other');
		assert.strictEqual('other', screen.getTitle());
	});

	it('checks if object implements a screen', () => {
		assert.ok(Screen.isImplementedBy(new Screen()));
	});

	it('evaluates surface scripts', (done) => {
		enterDocumentSurfaceElement(
			'surfaceId',
			'<script>window.sentinel=true;</script>'
		);
		var surface = new Surface('surfaceId');
		var screen = new Screen();
		assert.ok(!window.sentinel);
		screen
			.evaluateScripts({
				surfaceId: surface,
			})
			.then(() => {
				assert.ok(window.sentinel);
				delete window.sentinel;
				exitDocumentSurfaceElement('surfaceId');
				done();
			});
	});

	it('evaluates surface styles', (done) => {
		enterDocumentSurfaceElement(
			'surfaceId',
			'<style>body{background-color:rgb(0, 255, 0);}</style>'
		);
		var surface = new Surface('surfaceId');
		var screen = new Screen();

		screen
			.evaluateStyles({
				surfaceId: surface,
			})
			.then(() => {
				assertComputedStyle('backgroundColor', 'rgb(0, 255, 0)');
				exitDocumentSurfaceElement('surfaceId');
				done();
			});
	});
});

function enterDocumentSurfaceElement(surfaceId, opt_content) {
	dom.enterDocument(
		'<div id="' +
			surfaceId +
			'">' +
			(opt_content ? opt_content : '') +
			'</div>'
	);

	return document.getElementById(surfaceId);
}

function exitDocumentSurfaceElement(surfaceId) {
	return dom.exitDocument(document.getElementById(surfaceId));
}

function assertComputedStyle(property, value) {
	assert.strictEqual(
		value,
		window.getComputedStyle(document.body, null)[property]
	);
}
