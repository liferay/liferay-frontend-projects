import * as cfg from '../../config';
import {promptWithConfig} from '../index';

describe('promptWithConfig()', () => {
	it('works in batch mode', async () => {
		cfg.set({
			batchMode: true,
			answers: {
				test: {
					target: 'pedro',
					file: 'fortunato',
				},
			},
		});

		const answers = await promptWithConfig({}, 'test', [
			{
				name: 'target',
				default: 'perico',
			},
			{
				name: 'folder',
				default: 'jacinto',
			},
			{
				name: 'file',
			},
		]);

		expect(answers).toEqual({
			target: 'pedro',
			folder: 'jacinto',
			file: 'fortunato',
		});
	});

	it('works in interactive mode', async () => {
		cfg.set({
			answers: {
				test: {
					target: 'pedro',
					file: 'fortunato',
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
				default: 'perico',
			},
			{
				name: 'folder',
				default: 'jacinto',
			},
			{
				name: 'file',
			},
		]);

		expect(answers).toBe(returnedAnswers);
		expect(capturedPrompts).toEqual([
			{
				name: 'target',
				default: 'pedro',
			},
			{
				name: 'folder',
				default: 'jacinto',
			},
			{
				name: 'file',
				default: 'fortunato',
			},
		]);
	});
});
