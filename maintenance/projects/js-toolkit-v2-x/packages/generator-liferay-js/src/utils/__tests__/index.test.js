/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as cfg from '../../config';
import {formatLabels, promptWithConfig} from '../index';

describe('formatLabels()', () => {
	const labels = {
		labelOne: 'Label one',
		labelTwo: 'Label two',
	};

	it('works for raw', () => {
		const fl = formatLabels(labels);

		expect(fl.raw).toEqual({
			labelOne: 'Label one',
			labelTwo: 'Label two',
		});
	});

	it('works for quoted', () => {
		const fl = formatLabels(labels);

		expect(fl.quoted).toEqual({
			labelOne: "'Label one'",
			labelTwo: "'Label two'",
		});
	});

	it('works for template', () => {
		const fl = formatLabels(labels);

		expect(fl.template).toEqual({
			labelOne: "${Liferay.Language.get('label-one')}",
			labelTwo: "${Liferay.Language.get('label-two')}",
		});
	});

	it('works for js', () => {
		const fl = formatLabels(labels);

		expect(fl.js).toEqual({
			labelOne: "Liferay.Language.get('label-one')",
			labelTwo: "Liferay.Language.get('label-two')",
		});
	});

	it('works for jsx', () => {
		const fl = formatLabels(labels);

		expect(fl.jsx).toEqual({
			labelOne: "{Liferay.Language.get('label-one')}",
			labelTwo: "{Liferay.Language.get('label-two')}",
		});
	});
});

describe('promptWithConfig()', () => {
	it('works in batch mode', async () => {
		cfg.set({
			batchMode: true,
			answers: {
				test: {
					target: 'cfg-target',
					file: 'cfg-file',
				},
			},
		});

		const answers = await promptWithConfig({}, 'test', [
			{
				name: 'target',
				default: 'ans-target',
			},
			{
				name: 'folder',
				default: 'ans-folder',
			},
			{
				name: 'file',
			},
		]);

		expect(answers).toEqual({
			target: 'cfg-target',
			folder: 'ans-folder',
			file: 'cfg-file',
		});
	});

	it('works in interactive mode', async () => {
		cfg.set({
			answers: {
				test: {
					target: 'cfg-target',
					file: 'cfg-file',
				},
			},
		});

		const returnedAnswers = {};
		let capturedPrompts;

		const generator = {
			prompt: async (prompts) => {
				capturedPrompts = prompts;

				return returnedAnswers;
			},
		};

		const answers = await promptWithConfig(generator, 'test', [
			{
				name: 'target',
				default: 'ans-target',
			},
			{
				name: 'folder',
				default: 'ans-folder',
			},
			{
				name: 'file',
			},
		]);

		expect(answers).toBe(returnedAnswers);
		expect(capturedPrompts).toEqual([
			{
				name: 'target',
				default: 'cfg-target',
			},
			{
				name: 'folder',
				default: 'ans-folder',
			},
			{
				name: 'file',
				default: 'cfg-file',
			},
		]);
	});
});
