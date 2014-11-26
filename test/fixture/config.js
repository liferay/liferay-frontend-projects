module.exports = {
    "url": "http://localhost:3000/combo",
    "basePath": "/modules",
    "combine": true,
    "groups": {
        "chema": {
            "combine": true,
            "url": "http://localhost:3000/combo",
            "basePath": "/modules/chema",
            "modules": {
                "aui-chema-group-test1": {
                    "dependencies": [
                        "aui-base",
                        "aui-core"
                    ],
                    "path": "aui-chema-group-test1.js"
                },
                "aui-chema-group-test2": {
                    "dependencies": [
                        "aui-plugin-base"
                    ],
                    "path": "aui-chema-group-test2.js"
                }
            }
        },
        "ambrin": {
            "combine": true,
            "url": "http://localhost:3000/combo",
            "basePath": "/modules/ambrin",
            "modules": {
                "aui-ambrin-group-test3": {
                    "dependencies": [
                        "aui-base",
                        "aui-core"
                    ],
                    "path": "aui-ambrin-group-test3.js"
                },
                "aui-ambrin-group-test4": {
                    "dependencies": [
                        "aui-node"
                    ],
                    "path": "aui-ambrin-group-test4.js"
                }
            }
        }
    },
    "modules": {
        "aui-autocomplete": {
            "dependencies": [
                "aui-node",
                "aui-dialog"
            ],
            "path": "aui-autocomplete.js"
        },
        "aui-base": {
            "dependencies": [],
            "fullPath": "http://localhost:8081/modules/aui-base.js"
        },
        "aui-chema": {
            "dependencies": [
                "aui-autocomplete",
                "aui-event",
                "aui-node"
            ],
            "condition": {
                "trigger": "aui-nate",
                "test": "function () {\n    var el = document.createElement('input');\n    return 'placeholder' in el;\n}"
            },
            "path": "aui-chema.js"
        },
        "aui-core": {
            "dependencies": [],
            "path": "aui-core.js"
        },
        "aui-dialog": {
            "dependencies": [
                "aui-node",
                "aui-plugin-base"
            ],
            "condition": {
                "trigger": "aui-nate",
                "test": "function () {\n    return true;\n}"
            },
            "path": "aui-dialog.js"
        },
        "aui-dom-node": {
            "dependencies": [
                "aui-node"
            ],
            "path": "aui-dom-node.js"
        },
        "aui-event": {
            "dependencies": [
                "aui-node",
                "aui-plugin-base"
            ],
            "path": "aui-event.js"
        },
        "aui-nate": {
            "dependencies": [
                "aui-autocomplete",
                "aui-event"
            ],
            "path": "aui-nate.js"
        },
        "aui-node": {
            "dependencies": [
                "aui-base",
                "aui-core"
            ],
            "path": "aui-node.js"
        },
        "aui-plugin-base": {
            "dependencies": [],
            "path": "aui-plugin-base.js"
        },
        "aui-test": {
            "dependencies": [
                "aui-base"
            ],
            "condition": {
                "trigger": "aui-dialog",
                "test": "function () {\n    return false;\n}"
            },
            "path": "aui-test.js"
        },
        "aui-test2": {
            "dependencies": [
                "aui-base"
            ],
            "condition": {
                "trigger": "aui-plugin-base",
                "test": "function () {\n    return true;\n}"
            },
            "path": "aui-test2.js"
        }
    }
};