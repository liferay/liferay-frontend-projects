import {formatLabels} from '../l10n';

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
			labelOne: '\'Label one\'',
			labelTwo: '\'Label two\'',
		});
	});

	it('works for template', () => {
		const fl = formatLabels(labels);

		expect(fl.template).toEqual({
			labelOne: '${Liferay.Language.get(\'label-one\')}',
			labelTwo: '${Liferay.Language.get(\'label-two\')}',
		});
	});

	it('works for js', () => {
		const fl = formatLabels(labels);

		expect(fl.js).toEqual({
			labelOne: 'Liferay.Language.get(\'label-one\')',
			labelTwo: 'Liferay.Language.get(\'label-two\')',
		});
	});

	it('works for jsx', () => {
		const fl = formatLabels(labels);

		expect(fl.jsx).toEqual({
			labelOne: '{Liferay.Language.get(\'label-one\')}',
			labelTwo: '{Liferay.Language.get(\'label-two\')}',
		});
	});

	it('works for properties', () => {
		const fl = formatLabels(labels);

		expect(fl.properties).toEqual({
			'label-one': 'Label one',
			'label-two': 'Label two',
		});
	});
});
