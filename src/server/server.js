'use strict';

// Load modules

const Hapi = require('hapi');
const Inert = require('inert');
const Routes = require('./routes');
const Path = require('path');

// Declare internals

const internals = {
    serverHost: 'localhost',
    serverPort: process.env.PORT || 8080,
    webBaseURL: `http://${this.serverHost}:${this.serverPort}`,
    serverDefaults: {
        connections: {
            routes: {
                files: {
                    relativeTo: Path.join(__dirname, '../client')
                }
            }
        }
    }
};


internals.init = function () {

    const server = new Hapi.Server(internals.serverDefaults);

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
