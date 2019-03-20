#!/usr/bin/env node

/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

function log(...args) {
	// eslint-disable-next-line no-console
	console.log(...args);
}

function printBanner() {
	log('changelog.js reporting for duty');
}

function main() {
	printBanner();
}

main();
