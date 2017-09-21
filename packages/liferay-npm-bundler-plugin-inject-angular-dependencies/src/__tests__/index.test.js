import plugin from '../index';

// Package descriptor used in tests
const pkg = {
  id: '@angular/forms@1.0.0',
  name: '@angular/forms',
  version: '1.0.0',
  dir:
    `${process.cwd()}/packages/` +
    `liferay-npm-bundler-plugin-inject-angular-dependencies/` +
    `src/__tests__/packages/@angular%2Fforms@1.0.0`,
};

it('injects rxjs dependency in @angular/forms if not found', () => {
  const pkgJson = {
    name: '@angular/forms',
    version: '1.0.0',
  };

  plugin({pkg}, {pkgJson});

  expect(pkgJson.dependencies['rxjs']).toEqual('2.3.4');
});

it('does not inject rxjs dependency in @angular/forms if found', () => {
  const pkgJson = {
    name: '@angular/forms',
    version: '1.0.0',
    dependencies: {
      rxjs: '1.0.0',
    },
  };

  plugin({pkg}, {pkgJson});

  expect(pkgJson.dependencies['rxjs']).toEqual('1.0.0');
});
