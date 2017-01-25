/**
 * Created by chanupolphermpoon on 1/17/2017 AD.
 */

"use strict";


var Boom = require("boom");
var GraphModel = require("../../models/report/graph");
var graphModel = new GraphModel();

function GraphController() {

}

//--------------------------------------------------------------------------------
//
// Get section (Oracle WTUDSS Database)
//
//--------------------------------------------------------------------------------

GraphController.prototype.getTeacher = function (request, reply) {

    var roleId = request.params.roleId;
    var userName = request.params.userName;

    graphModel.getTeacher(roleId, userName, function (err, result) {
        if (err) {
            reply(Boom.internal("Cannot get Teacher list information", err));
        } else {
            reply(result);
        }
    });
};


GraphController.prototype.getSubjectInTeacherWithPeriod = function (request, reply) {

    var criteria = {
        tchCode: request.params.tchCode,
        periodCode: encodeURIComponent(request.params.periodCode)
        //periodCode: decodeURIComponent(request.params.periodCode)

    };

    graphModel.getSubjectInTeacherWithPeriod(criteria, function (err, result) {

        if (err) {
            reply(Boom.internal("Cannot get Subject list information", err));
        } else {
            reply(result);
        }

    });

};


//--------------------------------------------------------------------------------
//
// Get section (MSSQL CyberU  Database)
//
//--------------------------------------------------------------------------------

GraphController.prototype.getGraphDataInClassPercentage = function (request, reply) {


    var criteria = GraphController.prototype.returnCriteria(request);

    graphModel.getGraphDataInClassPercentage(criteria, function (err, result) {

        if (err) {
            reply(Boom.internal("Cannot get Student In Class information", err));
        } else {
            reply(result);
        }

    });

};

GraphController.prototype.getGraphDataPreTestPostTestPercentage = function (request, reply) {

    var criteria = GraphController.prototype.returnCriteria(request);

    graphModel.getGraphDataPreTestPostTestPercentage(criteria, function (err, result) {

        if (err) {
            reply(Boom.internal("Cannot get Pre-Test,Post-Test information", err));
        } else {
            reply(result);
        }

    });

};

GraphController.prototype.getIncreaseDecreasePercentage = function (request, reply) {

    var criteria = GraphController.prototype.returnCriteria(request);

    graphModel.getIncreaseDecreasePercentage(criteria, function (err, result) {

        if (err) {
            reply(Boom.internal("Cannot get Increase Decrease of Post-Test Percentage information", err));
        } else {
            reply(result);
        }

    });

};


GraphController.prototype.returnCriteria = function (request, reply) {

    var criteria = {
        tchCode: request.params.tchCode,
        periodCode: decodeURIComponent(request.params.periodCode),
        subjectCode: request.params.subjectCode,
        isPreTest: request.params.isPreTest,
    };

    return criteria;
};


module.exports = GraphController;