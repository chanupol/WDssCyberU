/**
 * Created by Aem on 2/8/2016 AD.
 */
"use strict";

// Tasks routes
exports.register = function (server, options, next) {
    //
    // Declare routes
    server.route([
        {
            method: "GET",
            path: "/{param*}",
            config: {
                auth: false
            },
            handler: {
                directory: {
                    path: "public",
                    listing: false,
                    index: true
                }
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    name: "routes-index",
    version: "1.0.0"
};
