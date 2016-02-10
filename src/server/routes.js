'use strict';

// Load modules

const Pages = require('./handlers/pages');
const Assets = require('./handlers/assets');

// Declare internals

const internals = {};

module.exports = [{
    method: 'GET',
    path: '/',
    handler: Pages.home
},{
    method: 'GET',
    path: '/{param*}',
    handler: Assets.servePublicDirectory
}];
