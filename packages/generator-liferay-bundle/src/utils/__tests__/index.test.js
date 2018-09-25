import * as cfg from '../../config';
import {promptWithConfig} from '../index';

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
			prompt: async prompts => {
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
