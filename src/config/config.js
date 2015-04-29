var __CONFIG__ = {
    url: 'http://localhost:3000/combo?',
    basePath: '/modules',
    combine: true,
    paths: {
        'jquery': 'http://code.jquery.com/jquery-2.1.3.min.js'
    }
};
__CONFIG__.modules = {
    "aui-base": {
        "dependencies": ["exports"],
        "path": "aui-base.js"
    },
    "aui-core": {
        "dependencies": ["exports"],
        "path": "aui-core.js"
    },
    "aui-dialog": {
        "dependencies": ["exports", "aui-base", "aui-core", "aui-event"],
        "path": "aui-dialog.js"
    },
    "aui-event": {
        "dependencies": ["exports"],
        "path": "aui-event.js"
    },
    "chema/chemaps/aui-chemaps": {
        "dependencies": ["exports", "aui-base"],
        "path": "chema/chemaps/aui-chemaps.js"
    },
    "ambrin/aui-ambrin": {
        "dependencies": ["exports", "aui-core"],
        "path": "ambrin/aui-ambrin.js"
    }
};