/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from '../file-path';

const savedNativeIsPosix = FilePath.nativeIsPosix;

describe('in posix systems', () => {
	beforeEach(() => {
		FilePath.nativeIsPosix = true;
	});

	afterEach(() => {
		FilePath.nativeIsPosix = savedNativeIsPosix;
	});

	it('toString works', () => {
		expect(new FilePath('/tmp/tt').toString()).toEqual('/tmp/tt');
	});

	it('asNative works', () => {
		expect(new FilePath('/tmp/tt').asNative).toEqual('/tmp/tt');
	});

	it('asPosix works', () => {
		expect(new FilePath('/tmp/tt').asPosix).toEqual('/tmp/tt');
	});

	it('asWindows works', () => {
		expect(new FilePath('/tmp/tt').asWindows).toEqual('\\tmp\\tt');
	});

	it('join works', () => {
		expect(
			new FilePath('/tmp/tt').join('nn', new FilePath('oo/pp')).asNative
		).toEqual('/tmp/tt/nn/oo/pp');
	});
});

describe('in windows systems', () => {
	beforeEach(() => {
		FilePath.nativeIsPosix = false;
	});

	afterEach(() => {
		FilePath.nativeIsPosix = savedNativeIsPosix;
	});

	it('toString works', () => {
		expect(new FilePath('c:\\tmp\\tt').toString()).toEqual('c:\\tmp\\tt');
	});

	it('asNative works', () => {
		expect(new FilePath('c:\\tmp\\tt').asNative).toEqual('c:\\tmp\\tt');
	});

	it('asPosix works', () => {
		expect(new FilePath('c:\\tmp\\tt').asPosix).toEqual('c:/tmp/tt');
	});

	it('asWindows works', () => {
		expect(new FilePath('c:\\tmp\\tt').asWindows).toEqual('c:\\tmp\\tt');
	});

	it('join works', () => {
		expect(
			new FilePath('c:\\tmp\\tt').join('nn', new FilePath('oo\\pp'))
				.asNative
		).toEqual('c:\\tmp\\tt\\nn\\oo\\pp');
	});
});

describe('posix constructor', () => {
	it('works in posix systems', () => {
		FilePath.nativeIsPosix = true;
		const filePath = new FilePath('/tmp/tt', {posix: true});
		FilePath.nativeIsPosix = savedNativeIsPosix;

		expect(filePath.asNative).toEqual('/tmp/tt');
	});

	it('works in windows systems', () => {
		FilePath.nativeIsPosix = false;
		const filePath = new FilePath('/tmp/tt', {posix: true});
		FilePath.nativeIsPosix = savedNativeIsPosix;

		expect(filePath.asNative).toEqual('\\tmp\\tt');
	});
});
