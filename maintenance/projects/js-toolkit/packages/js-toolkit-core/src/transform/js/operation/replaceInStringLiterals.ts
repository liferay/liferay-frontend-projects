/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {SourceCode, SourceTransform, replace} from '..';

import escapeStringRegExp from '../../../escapeStringRegExp';

export default function replaceInStringLiterals(
	from: string,
	to: string
): SourceTransform {
	return ((source) =>
		_replaceInStringLiterals(source, from, to)) as SourceTransform;
}

async function _replaceInStringLiterals(
	source: SourceCode,
	from: string,
	to: string
): Promise<SourceCode> {
	return await replace(source, {
		enter(node) {
			if (node.type !== 'Literal') {
				return;
			}

			const {value} = node;

			if (typeof value !== 'string') {
				return;
			}

			node.value = value.replace(
				new RegExp(escapeStringRegExp(from), 'g'),
				to
			);
		},
	});
}
