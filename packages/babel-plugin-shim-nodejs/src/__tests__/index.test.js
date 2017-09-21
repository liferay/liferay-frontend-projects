import * as babel from 'babel-core';
import plugin from '../index';

// We store the patched package.json information in this global var to be able
// to check it after the tests.
let patchedPackageJson;

const configuredPlugin = [
  [
    plugin,
    {
      patchPackageJson: (pkgJsonPath, moduleShims) => {
        patchedPackageJson = moduleShims;
      },
    },
  ],
];

beforeEach(() => {
  patchedPackageJson = {};
});

describe('when using Node.js globals', () => {
  it('shims Buffer global', () => {
    const source = `
		const b = Buffer.alloc(10);
	    `;

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toMatchSnapshot();
    expect(patchedPackageJson).toMatchSnapshot();
  });

  it('shims __dirname global', () => {
    const source = `
		console.log(__dirname);
	    `;

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toMatchSnapshot();
    expect(patchedPackageJson).toMatchSnapshot();
  });

  it('shims __filename global', () => {
    const source = `
		console.log(__filename);
	    `;

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toMatchSnapshot();
    expect(patchedPackageJson).toMatchSnapshot();
  });

  it('shims clearImmediate global', () => {
    const source = `
		clearImmediate({});
	    `;

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toMatchSnapshot();
    expect(patchedPackageJson).toMatchSnapshot();
  });

  it('shims global global', () => {
    const source = `
		console.log(global);
	    `;

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toMatchSnapshot();
    expect(patchedPackageJson).toMatchSnapshot();
  });

  it('shims process global', () => {
    const source = `
		console.log(process.env);
	    `;

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toMatchSnapshot();
    expect(patchedPackageJson).toMatchSnapshot();
  });

  it('shims setImmediate global', () => {
    const source = `
		const a = setImmediate(() => {});
	    `;

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toMatchSnapshot();
    expect(patchedPackageJson).toMatchSnapshot();
  });
});

describe('when using Node.js modules', () => {
  it('shims assert builtin module', () => {
    const source = 'require("assert");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-assert");');
    expect(patchedPackageJson).toEqual({'liferay-node-assert': '1.0.0'});
  });

  it('shims buffer builtin module', () => {
    const source = 'require("buffer");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-buffer");');
    expect(patchedPackageJson).toEqual({'liferay-node-buffer': '1.0.0'});
  });

  it('shims child_process builtin module', () => {
    const source = 'require("child_process");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-child_process");');
    expect(patchedPackageJson).toEqual({
      'liferay-node-child_process': '1.0.0',
    });
  });

  it('shims cluster builtin module', () => {
    const source = 'require("cluster");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-cluster");');
    expect(patchedPackageJson).toEqual({'liferay-node-cluster': '1.0.0'});
  });

  it('shims console builtin module', () => {
    const source = 'require("console");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-console");');
    expect(patchedPackageJson).toEqual({'liferay-node-console': '1.0.0'});
  });

  it('shims constants builtin module', () => {
    const source = 'require("constants");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-constants");');
    expect(patchedPackageJson).toEqual({
      'liferay-node-constants': '1.0.0',
    });
  });

  it('shims crypto builtin module', () => {
    const source = 'require("crypto");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-crypto");');
    expect(patchedPackageJson).toEqual({'liferay-node-crypto': '1.0.0'});
  });

  it('shims dgram builtin module', () => {
    const source = 'require("dgram");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-dgram");');
    expect(patchedPackageJson).toEqual({'liferay-node-dgram': '1.0.0'});
  });

  it('shims dns builtin module', () => {
    const source = 'require("dns");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-dns");');
    expect(patchedPackageJson).toEqual({'liferay-node-dns': '1.0.0'});
  });

  it('shims domain builtin module', () => {
    const source = 'require("domain");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-domain");');
    expect(patchedPackageJson).toEqual({'liferay-node-domain': '1.0.0'});
  });

  it('shims events builtin module', () => {
    const source = 'require("events");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-events");');
    expect(patchedPackageJson).toEqual({'liferay-node-events': '1.0.0'});
  });

  it('shims fs builtin module', () => {
    const source = 'require("fs");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-fs");');
    expect(patchedPackageJson).toEqual({'liferay-node-fs': '1.0.0'});
  });

  it('shims http builtin module', () => {
    const source = 'require("http");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-http");');
    expect(patchedPackageJson).toEqual({'liferay-node-http': '1.0.0'});
  });

  it('shims https builtin module', () => {
    const source = 'require("https");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-https");');
    expect(patchedPackageJson).toEqual({'liferay-node-https': '1.0.0'});
  });

  it('shims module builtin module', () => {
    const source = 'require("module");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-module");');
    expect(patchedPackageJson).toEqual({'liferay-node-module': '1.0.0'});
  });

  it('shims net builtin module', () => {
    const source = 'require("net");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-net");');
    expect(patchedPackageJson).toEqual({'liferay-node-net': '1.0.0'});
  });

  it('shims os builtin module', () => {
    const source = 'require("os");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-os");');
    expect(patchedPackageJson).toEqual({'liferay-node-os': '1.0.0'});
  });

  it('shims path builtin module', () => {
    const source = 'require("path");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-path");');
    expect(patchedPackageJson).toEqual({'liferay-node-path': '1.0.0'});
  });

  it('shims process builtin module', () => {
    const source = 'require("process");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-process");');
    expect(patchedPackageJson).toEqual({'liferay-node-process': '1.0.0'});
  });

  it('shims punycode builtin module', () => {
    const source = 'require("punycode");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-punycode");');
    expect(patchedPackageJson).toEqual({
      'liferay-node-punycode': '1.0.0',
    });
  });

  it('shims querystring builtin module', () => {
    const source = 'require("querystring");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-querystring");');
    expect(patchedPackageJson).toEqual({
      'liferay-node-querystring': '1.0.0',
    });
  });

  it('shims readline builtin module', () => {
    const source = 'require("readline");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-readline");');
    expect(patchedPackageJson).toEqual({
      'liferay-node-readline': '1.0.0',
    });
  });

  it('shims repl builtin module', () => {
    const source = 'require("repl");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-repl");');
    expect(patchedPackageJson).toEqual({'liferay-node-repl': '1.0.0'});
  });

  it('shims stream builtin module', () => {
    const source = 'require("stream");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-stream");');
    expect(patchedPackageJson).toEqual({'liferay-node-stream': '1.0.0'});
  });

  it('shims string_decoder builtin module', () => {
    const source = 'require("string_decoder");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-string_decoder");');
    expect(patchedPackageJson).toEqual({
      'liferay-node-string_decoder': '1.0.0',
    });
  });

  it('shims timers builtin module', () => {
    const source = 'require("timers");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-timers");');
    expect(patchedPackageJson).toEqual({'liferay-node-timers': '1.0.0'});
  });

  it('shims tls builtin module', () => {
    const source = 'require("tls");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-tls");');
    expect(patchedPackageJson).toEqual({'liferay-node-tls': '1.0.0'});
  });

  it('shims tty builtin module', () => {
    const source = 'require("tty");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-tty");');
    expect(patchedPackageJson).toEqual({'liferay-node-tty': '1.0.0'});
  });

  it('shims url builtin module', () => {
    const source = 'require("url");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-url");');
    expect(patchedPackageJson).toEqual({'liferay-node-url': '1.0.0'});
  });

  it('shims util builtin module', () => {
    const source = 'require("util");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-util");');
    expect(patchedPackageJson).toEqual({'liferay-node-util': '1.0.0'});
  });

  it('shims v8 builtin module', () => {
    const source = 'require("v8");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-v8");');
    expect(patchedPackageJson).toEqual({'liferay-node-v8': '1.0.0'});
  });

  it('shims vm builtin module', () => {
    const source = 'require("vm");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-vm");');
    expect(patchedPackageJson).toEqual({'liferay-node-vm': '1.0.0'});
  });

  it('shims zlib builtin module', () => {
    const source = 'require("zlib");';

    const {code} = babel.transform(source, {
      filenameRelative: __filename,
      plugins: configuredPlugin,
    });

    expect(code).toEqual('require("liferay-node-zlib");');
    expect(patchedPackageJson).toEqual({'liferay-node-zlib': '1.0.0'});
  });
});
