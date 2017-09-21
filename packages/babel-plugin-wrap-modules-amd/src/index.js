import template from 'babel-template';

const buildDefine = template(`
     define(DEPS, function(module, exports, require) {
 	    SOURCE
     })
 `);

/**
  * @return {object} a babel visitor
  */
export default function({types: t}) {
  const wrapVisitor = {
    Identifier(path, {dependencies}) {
      const node = path.node;

      if (node.name === 'require') {
        const parent = path.parent;

        if (
          t.isCallExpression(parent) &&
          parent.callee === node &&
          parent.arguments.length == 1
        ) {
          const argument0 = parent.arguments[0];

          if (t.isLiteral(argument0)) {
            const moduleName = argument0.value;

            dependencies[moduleName] = moduleName;
          }
        }
      }
    },
  };

  return {
    visitor: {
      Program: {
        enter(path, state) {
          state.dependencies = {};
        },
        exit(path, {opts, dependencies}) {
          // We must traverse the AST again because some plugins emit
          // their require() calls after exiting Program node :-(
          path.traverse(wrapVisitor, {opts, dependencies});

          const node = path.node;
          const body = node.body;

          dependencies = Object.keys(dependencies).map(dep => `'${dep}'`);

          const buildDeps = template(`[
                         'module', 'exports', 'require' 
                         ${dependencies.length > 0 ? ',' : ''} 
                         ${dependencies.join()}
                     ]`);

          node.body = [
            buildDefine({
              SOURCE: body,
              DEPS: buildDeps(),
            }),
          ];
        },
      },
    },
  };
}
