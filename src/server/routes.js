'use strict';

// Load modules

const Pages = require('./handlers/pages');

// Declare internals

const internals = {};


module.exports = [{
    method: 'GET',
    path: '/',
    handler: Pages.home
}];
