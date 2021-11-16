/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Loader from './loader';

const cfg = window.__CONFIG__ || {};

const namespace = typeof cfg.namespace === 'string' ? cfg.namespace : undefined;
const exposeGlobal = cfg.exposeGlobal === undefined ? true : cfg.exposeGlobal;
const loader = new Loader(cfg);

if (namespace) {
	const ns = window[namespace] ? window[namespace] : {};

	ns.Loader = loader;
	window[namespace] = ns;
}
else {
	window.Loader = loader;
}

if (exposeGlobal) {
	window.Loader = loader;
	window.require = Loader.prototype.require.bind(loader);
	window.define = Loader.prototype.define.bind(loader);
	window.define.amd = {};
}
