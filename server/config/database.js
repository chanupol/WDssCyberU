/**
 * Created by Aem on 2/8/2016 AD.
 */
"use strict";

module.exports = function () {

    var async = require("async");
    var parameters = [];

    function Database() {
    }

    //--------------------------------------------------------------------------------
    //
    // Connection string
    //
    //--------------------------------------------------------------------------------
    Database.prototype.oracleConfig = function () {
        var oracleConfig = {
            user: "WTUDSS",
            password: "WTUDSS12345678",
            //connectString : "wstock.dyndns.org/orcl.localdomain",
            //connectString : "10.1.10.16/orcl.localdomain",
            //connectString: "113.53.249.27/orcl.localdomain"
            connectString: "113.53.249.27/orcl" //Dev
            //connectString: "113.53.249.21/orcl" //PROD
        };

        return oracleConfig;
    };


    Database.prototype.mssqlConfig = function () {

        var mssqlConfig = {

            server: '113.53.249.20',
            user: 'sa',
            //server: '27.254.43.145',
            //user: 'wtuuser',
            //password: '123qwe,.0216',
            password: 'ouj8nv@,boSRV',
            database: 'cyberu_db'

        };
        return mssqlConfig;

    };

    //--------------------------------------------------------------------------------
    //
    // Generate oracle parameter and call store procedure command.
    //
    //--------------------------------------------------------------------------------
    Database.prototype.addParameter = function (parameter, value) {
        var obj = {};
        obj[parameter] = value;

        parameters.push(obj);
    };

    Database.prototype.clearParameter = function () {
        parameters = [];
    };

    Database.prototype.getParameter = function () {
        return parameters.reduce(function (result, item) {
            var key = Object.keys(item)[0]; //first property: a, b, c
            result[key] = item[key];
            return result;
        }, {});
    };

    Database.prototype.getParameterArr = function () {
        return parameters;
    };

    Database.prototype.getProcedureCommand = function (name) {
        var parameterName = "";
        var comma = "";

        parameters.reduce(function (result, item) {
            if (parameterName != "") {
                comma = ", ";
            }

            parameterName += comma + ":" + Object.keys(item)[0];
            return parameterName;
        }, "");

        return "BEGIN " + name + "(" + parameterName + "); END;";
    };

    //--------------------------------------------------------------------------------
    //
    // Maximum rows of cursor
    //
    //--------------------------------------------------------------------------------
    Database.prototype.MaximumCursorRows = function () {
        var maximuCursorRows = 100000;

        return maximuCursorRows;
    };

    //--------------------------------------------------------------------------------
    //
    // Fetch data form cursor
    //
    //--------------------------------------------------------------------------------

    Database.prototype.FetchRow = function (resultSet, resultRows, callback) {
        resultSet.getRows(100, function (err, rows) {
            if (err) {
                callback(err, resultRows);
            } else if (rows.length === 0) {
                callback(null, resultRows);
            } else if (rows.length > 0) {
                resultRows.push.apply(resultRows, rows);

                Database.prototype.FetchRow(resultSet, resultRows, callback);
            }
        });
    };

    //--------------------------------------------------------------------------------
    //
    // Fetch data form cursor
    //
    //--------------------------------------------------------------------------------
    Database.prototype.FetchCursorRow = function (resultSet, resultRows, callback) {
        resultSet.getRows(100, function (err, rows) {
            if (err) {
                callback(err, resultRows);
            } else if (rows.length === 0) {
                callback(null, resultRows);
            } else if (rows.length > 0) {
                resultRows.push.apply(resultRows, rows);

                Database.prototype.FetchCursorRow(resultSet, resultRows, callback);
            }
        });
    };

    //--------------------------------------------------------------------------------
    //
    // Disconnect from oracle section
    //
    //--------------------------------------------------------------------------------
    Database.prototype.DoRelease = function (connection) {
        if (connection) {
            connection.release(function (err) {
                if (err) {
                    console.error(err.message);
                }
            });
        }
    };

    //
    // Close only one result set and then release connection.
    Database.prototype.DoClose = function (connection, resultSet) {
        resultSet.close(
            function (err) {
                if (err) {
                    console.error(err.message);
                }

                Database.prototype.DoRelease(connection);
            });
    };

    //
    // Close all of result set and then release connection.
    Database.prototype.DoCloses = function (connection, resultSets) {
        async.each(resultSets, function (item, callback) {
            item.close(function (err) {
                if (err) {
                    console.error(err.message);
                }

                callback();
            });
        }, function (err) {
            if (err) {
                console.log(err);
            }

            //This function is called when the whole forEach loop is over
            Database.prototype.DoRelease(connection);
        });
    };

    return new Database();
};