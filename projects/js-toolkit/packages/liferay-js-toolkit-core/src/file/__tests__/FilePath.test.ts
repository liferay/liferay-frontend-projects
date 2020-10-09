/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from '../FilePath';

const savedNativeIsPosix = FilePath.nativeIsPosix;

// Our CI runs on both POSIX and Windows, so both branches of this `if`/`else`
// get covered.

if (process.platform === 'win32') {
	describe('in windows systems', () => {
		it('toString works', () => {
			expect(new FilePath('c:\\tmp\\tt').toString()).toEqual(
				'c:\\tmp\\tt'
			);
		});

		it('asNative works', () => {
			expect(new FilePath('c:\\tmp\\tt').asNative).toEqual('c:\\tmp\\tt');
		});

		it('asPosix works', () => {
			expect(new FilePath('c:\\tmp\\tt').asPosix).toEqual('c:/tmp/tt');
		});

		it('asWindows works', () => {
			expect(new FilePath('c:\\tmp\\tt').asWindows).toEqual(
				'c:\\tmp\\tt'
			);
		});

		it('join works', () => {
			expect(
				new FilePath('c:\\tmp\\tt').join('nn', new FilePath('oo\\pp'))
					.asNative
			).toEqual('c:\\tmp\\tt\\nn\\oo\\pp');
		});

		it('toDotRelative works', () => {
			expect(new FilePath('').toDotRelative().asNative).toEqual('.');
			expect(new FilePath('a\\path').toDotRelative().asNative).toEqual(
				'.\\a\\path'
			);

			expect(new FilePath('.').toDotRelative().asNative).toEqual('.');
			expect(new FilePath('.\\a\\path').toDotRelative().asNative).toEqual(
				'.\\a\\path'
			);
			expect(
				new FilePath('..\\a\\path').toDotRelative().asNative
			).toEqual('..\\a\\path');
		});
	});
}
else {
	describe('in posix systems', () => {
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
				new FilePath('/tmp/tt').join('nn', new FilePath('oo/pp'))
					.asNative
			).toEqual('/tmp/tt/nn/oo/pp');
		});

		it('toDotRelative works', () => {
			expect(new FilePath('').toDotRelative().asNative).toEqual('.');
			expect(new FilePath('a/path').toDotRelative().asNative).toEqual(
				'./a/path'
			);

			expect(new FilePath('.').toDotRelative().asNative).toEqual('.');
			expect(new FilePath('./a/path').toDotRelative().asNative).toEqual(
				'./a/path'
			);
			expect(new FilePath('../a/path').toDotRelative().asNative).toEqual(
				'../a/path'
			);
		});
	});
}

describe('posix constructor', () => {
	it('works in posix systems', () => {
		(FilePath as object)['nativeIsPosix'] = true;
		const filePath = new FilePath('/tmp/tt', {posix: true});
		(FilePath as object)['nativeIsPosix'] = savedNativeIsPosix;

		expect(filePath.asNative).toEqual('/tmp/tt');
	});

	it('works in windows systems', () => {
		(FilePath as object)['nativeIsPosix'] = false;
		const filePath = new FilePath('/tmp/tt', {posix: true});
		(FilePath as object)['nativeIsPosix'] = savedNativeIsPosix;

		expect(filePath.asNative).toEqual('\\tmp\\tt');
	});
});
