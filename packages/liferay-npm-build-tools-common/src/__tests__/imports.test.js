import {unrollImportsConfig} from '../imports';

it('unrollImportsConfig works', () => {
	const imports = unrollImportsConfig({
		provider1: {
			dep1: '^1.0.0',
			dep2: '^2.0.0',
		},
		provider2: {
			dep9: '^9.0.0',
			dep8: '^8.0.0',
		},
	});

	expect(imports['dep1']).toMatchObject({
		name: 'provider1',
		version: '^1.0.0',
	});
	expect(imports['dep2']).toMatchObject({
		name: 'provider1',
		version: '^2.0.0',
	});
	expect(imports['dep9']).toMatchObject({
		name: 'provider2',
		version: '^9.0.0',
	});
	expect(imports['dep8']).toMatchObject({
		name: 'provider2',
		version: '^8.0.0',
	});
});

it('unrollImportsConfig throws for duplicated definitions', () => {
	expect(() =>
		unrollImportsConfig({
			provider1: {
				dep1: '^1.0.0',
			},
			provider2: {
				dep1: '^1.0.0',
			},
		})
	).toThrow();
});
