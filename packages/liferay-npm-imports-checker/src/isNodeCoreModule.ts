/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * List of built-in Node.js v10.16.3 modules as returned by
 * require('module').builtinModules
 */
const nodeCoreModules = new Set<string>([
	'async_hooks',
	'assert',
	'buffer',
	'child_process',
	'console',
	'constants',
	'crypto',
	'cluster',
	'dgram',
	'dns',
	'domain',
	'events',
	'fs',
	'http',
	'http2',
	'_http_agent',
	'_http_client',
	'_http_common',
	'_http_incoming',
	'_http_outgoing',
	'_http_server',
	'https',
	'inspector',
	'module',
	'net',
	'os',
	'path',
	'perf_hooks',
	'process',
	'punycode',
	'querystring',
	'readline',
	'repl',
	'stream',
	'_stream_readable',
	'_stream_writable',
	'_stream_duplex',
	'_stream_transform',
	'_stream_passthrough',
	'_stream_wrap',
	'string_decoder',
	'sys',
	'timers',
	'tls',
	'_tls_common',
	'_tls_wrap',
	'trace_events',
	'tty',
	'url',
	'util',
	'v8',
	'vm',
	'zlib',
	'v8/tools/splaytree',
	'v8/tools/codemap',
	'v8/tools/consarray',
	'v8/tools/csvparser',
	'v8/tools/profile',
	'v8/tools/profile_view',
	'v8/tools/logreader',
	'v8/tools/arguments',
	'v8/tools/tickprocessor',
	'v8/tools/SourceMap',
	'v8/tools/tickprocessor-driver',
	'node-inspect/lib/_inspect',
	'node-inspect/lib/internal/inspect_client',
	'node-inspect/lib/internal/inspect_repl',
]);

/**
 * Test whether a module name is a Node.js core module
 * @param modulePath the module path
 * @return true if module is a Node.js core module
 */
export default function isNodeCoreModule(modulePath: string): boolean {
	return nodeCoreModules.has(modulePath);
}
