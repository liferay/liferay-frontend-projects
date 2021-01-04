/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

var globals = globals || {};

if (typeof window !== 'undefined') {
	globals.window = window;
}

if (typeof document !== 'undefined') {
	globals.document = document;
}

export default globals;
