'use strict';

// Load modules

const Hapi = require('hapi');
const Inert = require('inert');
const Routes = require('./routes');

// Declare internals

const internals = {
    serverHost: 'localhost',
    serverPort: process.env.PORT || 8080
};

internals.webBaseURL = `http://${internals.serverHost}:${internals.serverPort}`;

internals.init = function () {

    const server = new Hapi.Server();
    server.connection({ port: internals.serverPort });

    server.bind({
        webBaseUrl: internals.webBaseURL
    });


    server.register([Inert], (err) => {

        if (err) {
            throw err;
        }

        server.route(Routes);

        server.start(() => {

            console.log('Started server at', server.info.uri);
        });
    });

};

internals.init();
