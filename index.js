/**
 * Created by chanupolphermpoon on 3/28/2016 AD.
 */

'use strict';

var Hapi = require('hapi');
var server = new Hapi.Server();

//
// Create server
server.connection({
    //host: "27.254.43.145",
    host: "0.0.0.0",
    port: 8008,
    routes: {
        cors: true
    }
});

//
// Add routes
var plugins = [
    {
        register: require("inert")
    },
    {
        register: require("./server/routes/index.js")
    },
    {
        register: require('./server/routes/report/graph.js')
    }];

server.register(plugins, function (err) {
    if (err) {
        throw err;
    }

    if (!module.parent) {
        server.start(function (err) {
            if (err) {
                throw err;
            }

            console.log("info", "server running at: " + server.info.uri);
        });
    }
});

module.exports = server;