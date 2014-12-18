var __CONFIG__ = {
    "url": "http://localhost:3000/combo",
    "basePath": "/modules",
    "combine": true,
    "modules": {
        "aui-base": {
            "dependencies": [
                "exports"
            ],
            "path": "aui-base.js"
        },
        "aui-core": {
            "dependencies": [
                "exports"
            ],
            "path": "aui-core.js"
        },
        "aui-dialog": {
            "dependencies": [
                "aui-base",
                "aui-core",
                "aui-event",
                "exports"
            ],
            "path": "aui-dialog.js"
        },
        "aui-event": {
            "dependencies": [
                "exports"
            ],
            "path": "aui-event.js"
        },
        "chema/chemaps/aui-chemaps": {
            "dependencies": [
                "aui-base",
                "exports"
            ],
            "path": "chema/chemaps/aui-chemaps.js"
        },
        "ambrin/aui-ambrin": {
            "dependencies": [
                "aui-core",
                "exports"
            ],
            "path": "ambrin/aui-ambrin.js"
        }
    }
};