/**
 * Created by chanupolphermpoon on 1/17/2017 AD.
 */

"use strict";

var Joi = require("joi");
var GraphController = require("../../controllers/report/graph");

exports.register = function (server, options, next) {
    //
    // Setup the controllers
    var graphController = new GraphController();

    //
    // Binds all methods
    // when declaring handlers
    server.bind(graphController);

    //
    // Declare routes
    server.route([
        {
            method: "GET",
            path: "/api/graph/tch/list/{roleId}/{userName}",

            config: {
                handler: graphController.getTeacher,
                validate: {
                    params: {
                        roleId: Joi.number().required(),
                        userName: Joi.string().required()
                    }
                }
            }
        },
        {
            method: "GET",
            path: "/api/graph/tch/subjects/list/{tchCode}/{periodCode}",

            config: {
                handler: graphController.getSubjectInTeacherWithPeriod,
                validate: {
                    params: {
                        tchCode: Joi.string().required(),
                        periodCode: Joi.string().required()
                    }
                }
            }
        },
        {
            method: "GET",
            path: "/api/graph/tch/period/subjects/list/{tchCode}/{periodCode}/{subjectCode}",

            config: {
                handler: graphController.getGraphDataInClassPercentage,
                validate: {
                    params: {
                        tchCode: Joi.string().required(),
                        periodCode: Joi.string().required(),
                        subjectCode: Joi.string().required()
                    }
                }
            }
        },
        {
            method: "GET",
            path: "/api/graph/tch/period/test/list/{tchCode}/{periodCode}/{subjectCode}/{isPreTest}",

            config: {
                handler: graphController.getGraphDataPreTestPostTestPercentage,
                validate: {
                    params: {
                        tchCode: Joi.string().required(),
                        periodCode: Joi.string().required(),
                        subjectCode: Joi.string().required(),
                        isPreTest: Joi.string().max(1).required() // Y = Pre-Test,N = Post-Test
                    }
                }
            }
        },
        {
            method: "GET",
            path: "/api/graph/tch/period/pretestposttest/list/{tchCode}/{periodCode}/{subjectCode}",

            config: {
                handler: graphController.getGraphDataPreTestPostTestPercentage,
                validate: {
                    params: {
                        tchCode: Joi.string().required(),
                        periodCode: Joi.string().required(),
                        subjectCode: Joi.string().required()
                    }
                }
            }
        },
        {
            method: "GET",
            path: "/api/graph/tch/period/increasedecrease/posttest/list/{tchCode}/{periodCode}/{subjectCode}",

            config: {
                handler: graphController.getIncreaseDecreasePercentage,
                validate: {
                    params: {
                        tchCode: Joi.string().required(),
                        periodCode: Joi.string().required(),
                        subjectCode: Joi.string().required()
                    }
                }
            }
        }
    ]);

    next();

};

exports.register.attributes = {
    name: "routes-command-graph",
    version: "1.0.0"
};