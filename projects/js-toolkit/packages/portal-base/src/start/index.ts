/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project, format} from '@liferay/js-toolkit-core';

import abort from '../util/abort';
import customElement from './customElement';

const {fail, print} = format;

export default async function start(): Promise<void> {
	const project = new Project('.');

	try {
		switch (project.build.type) {
			case 'customElement':
				await customElement(project);
				break;

			default:
				print(
					fail`Projects of type ${project.build.type} cannot be started`
				);
				break;
		}
	}
	catch (error) {
		abort(`Build failed!\n${error.stack}`);
	}
}
