/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

var express = require('express');
var multer = require('multer');
var app = express();
var upload = multer();

// Serve files

app.use(express.static('../../'));

app.post('/post', upload.array(), (req, res, _next) => {
	var content = '<div id="result1">';
	content += JSON.stringify(req.body, 5);
	content += '</div>';
	res.end(content);
});

app.post('/post-get', upload.array(), (_req, res, _next) => {
	res.redirect('/examples/form/redirect.html');
});

// Server

app.listen(3000);
