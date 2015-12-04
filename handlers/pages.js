'use strict';

// Load modules

// Declare internals

const internals = {};


exports.home = function (request, reply) {

    reply.file('./public/index.html');
};
