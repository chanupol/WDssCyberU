/**
 * Created by chanupolphermpoon on 1/17/2017 AD.
 */

"use strict";
//var oracledb = require("oracledb");
var mssql = require('mssql');
var Database = require("../../config/database");
var async = require('async');
var http = require('http');

//oracledb.autoCommit = true;

function GraphModel() {
}

//--------------------------------------------------------------------------------
//
// Get section (Oracle WTUDSS Database)
//
//--------------------------------------------------------------------------------

const uri = "http://0.0.0.0:8000";

function getDataFromOracleApi(url, callback) {
    http.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            //console.log(chunk);
            body += chunk;
        });

        res.on('end', function () {
            var tchDataResponse = JSON.parse(body);
            console.dir(tchDataResponse);
            callback(null, tchDataResponse);
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
        callback(err, null);
    });
}
GraphModel.prototype.getTeacher = function (roleId, userName, callback) {


    var url = uri + "/api/graph/tch/list/" + roleId + "/" + userName;


    getDataFromOracleApi(url, callback);

};

GraphModel.prototype.getSubjectInTeacherWithPeriod = function (criteria, callback) {


    var url = uri + "/api/graph/tch/subjects/list/" + criteria.tchCode + "/" + criteria.periodCode;

    getDataFromOracleApi(url, callback);

    /*var database = new Database();
     oracledb.outFormat = oracledb.OBJECT;

     oracledb.getConnection(database.oracleConfig(), function (err, connection) {
     if (err) {
     console.error(err.message);
     database.DoRelease(connection);
     callback(err, null);
     } else {

     database.addParameter("tchCode", criteria.tchCode);
     database.addParameter("periodCode", criteria.periodCode);
     database.addParameter("cursorSubjects", {type: oracledb.CURSOR, dir: oracledb.BIND_OUT});

     connection.execute(database.getProcedureCommand("SP_GET_SUBJECTS_IN_TCH_PERIOD"), database.getParameter(), function (err, result) {
     if (err) {
     console.error(err.message);
     database.DoRelease(connection);
     callback(err, null);
     } else {
     var obj = result.outBinds;

     database.FetchRow(obj.cursorSubjects, [], function (err, cursorSubjects) {
     if (err) {
     console.error(err);
     }

     database.DoRelease(connection);
     callback(err, cursorSubjects);
     })
     }
     });
     }
     });*/


};


//--------------------------------------------------------------------------------
//
// Get section (MSSQL CyberU  Database)
//
//--------------------------------------------------------------------------------

GraphModel.prototype.getGraphDataInClassPercentage = function (criteria, callback) {


    var database = new Database();

    mssql.connect(database.mssqlConfig(), function (err) {

        var subjectCodeCondition = " ";

        if (err) console.log(err);

        var request = new mssql.Request();

        request.input('tchCode', mssql.NVarChar(10), criteria.tchCode);
        request.input('periodCode', mssql.NVarChar(5), criteria.periodCode);

        if (criteria.subjectCode != 0) {
            request.input('subjectCode', mssql.NVarChar(10), criteria.subjectCode);
            subjectCodeCondition = "AND sed.SubjectCode = @subjectCode  ";
        }


        var declareTableVariable = "DECLARE @DataForGraph TABLE ( " +
            "Teacher NVARCHAR(255) NOT NULL ," +
            "StuCode NVARCHAR(10) NOT NULL ," +
            "SubjectCode NVARCHAR(10) NOT NULL ," +
            "tmpSubjectUnitPre NVARCHAR(20) NOT NULL ," +
            "UnitID INT NOT NULL ," +
            "UnitName NVARCHAR(255) NOT NULL ," +
            "LearnPCT DECIMAL NOT NULL ," +
            "PeriodCode NVARCHAR(4) NOT NULL);";


        var insertIntoTbVarDataStatement = "INSERT  INTO @DataForGraph " +
            "SELECT  DISTINCT " +
            "( sed.TchCode + ' ' + tch.TchPName + ' ' + tch.TchFName + ' ' + tch.TchLName ) Teacher ," +
            "sed.StuCode ,sed.SubjectCode ," +
            "( sed.SubjectCode + CAST(l.UnitID AS NVARCHAR(10)) + SUBSTRING(sed.EnrollNo, 0, CHARINDEX('-', sed.EnrollNo)) ) tmpSubjectUnitPre ," +
            "l.UnitID ,vsu.UnitName ,l.LearnPCT ,SUBSTRING(sed.EnrollNo, 0, CHARINDEX('-', sed.EnrollNo)) AS PeriodCode " +
            "FROM    wtuuser.tbStuUnitLearn l " +
            "JOIN wtuuser.tbStuEnrollDetail sed ON l.StuEnrollDetail_Idx = sed.Idx " +
            "AND sed.TchCode = @tchCode " +
            subjectCodeCondition +
            "JOIN wtuuser.tbStuUnitVdoTopic suvt ON l.Idx = suvt.StuUnitLearn_Idx " +
            "JOIN wtuuser.tbVdoSet_Unit vsu ON vsu.Idx = suvt.VdoSet_Unit_Idx " +
            "JOIN wtuuser.tbTeacher tch ON tch.Idx = sed.Teacher_Idx " +
            "WHERE   SUBSTRING(sed.EnrollNo, 0, CHARINDEX('-', sed.EnrollNo)) = @periodCode " +
            "ORDER BY SUBSTRING(sed.EnrollNo, 0, CHARINDEX('-', sed.EnrollNo)) ," +
            "sed.StuCode ,sed.SubjectCode ,l.UnitID; ";


        var getDataStatement = "SELECT  countZeroPercent = " +
            "( SELECT COUNT(g.StuCode) " +
            "    FROM   @DataForGraph g " +
            "    WHERE  ( g.LearnPCT < 0.0 AND g.tmpSubjectUnitPre = gg.tmpSubjectUnitPre ) " +
            "), " +
            "countFiftyPercent = " +
            "( SELECT    COUNT(g.StuCode) " +
            "   FROM      @DataForGraph g " +
            "   WHERE     ( ( g.LearnPCT > 1 AND g.LearnPCT <= 50.0 ) AND ( g.tmpSubjectUnitPre = gg.tmpSubjectUnitPre ) ) " +
            "), " +
            "countEightyPercent = " +
            "( SELECT    COUNT(g.StuCode) " +
            "   FROM      @DataForGraph g " +
            "   WHERE     ( ( g.LearnPCT > 50.0 AND g.LearnPCT <= 80.0 )  AND ( g.tmpSubjectUnitPre = gg.tmpSubjectUnitPre ) ) " +
            "), " +
            "count100Percent = " +
            "( SELECT    COUNT(g.StuCode) " +
            "   FROM      @DataForGraph g " +
            "   WHERE     ( ( g.LearnPCT > 80.0 AND g.LearnPCT <= 100.0 ) AND ( g.tmpSubjectUnitPre = gg.tmpSubjectUnitPre ) ) " +
            "), " +
            "gg.Teacher ,gg.SubjectCode , gg.UnitID , gg.UnitName , gg.tmpSubjectUnitPre " +
            "   FROM    @DataForGraph gg " +
            "   GROUP BY gg.SubjectCode , gg.UnitID , gg.UnitName ,gg.tmpSubjectUnitPre ,gg.Teacher " +
            "order by gg.Teacher , " +
            "gg.SubjectCode , " +
            "gg.UnitID";


        request.query(declareTableVariable + insertIntoTbVarDataStatement + getDataStatement).then(function (result) {

            callback(null, result);

        }).catch(function (err) {
            console.log(err.message);
            //console.log(result);
            callback(err, null);
        });
    });


};


GraphModel.prototype.getGraphDataPreTestPostTestPercentage = function (criteria, callback) {


    var database = new Database();

    mssql.connect(database.mssqlConfig(), function (err) {

        var subjectCodeCondition = " ";
        var isPreTestCondition = " ";

        if (err) console.log(err);

        var request = new mssql.Request();

        request.input('tchCode', mssql.NVarChar(10), criteria.tchCode);
        request.input('periodCode', mssql.NVarChar(5), criteria.periodCode);

        if (criteria.subjectCode != 0) {
            request.input('subjectCode', mssql.NVarChar(10), criteria.subjectCode);
            subjectCodeCondition = " AND sut.SubjectCode = @subjectCode  ";
        }

        if (criteria.isPreTest != undefined) {
            // 1: Pre-Test , 3: Post-Test
            request.input('isPreTest', mssql.NVarChar(1), (criteria.isPreTest == "Y") ? 1 : 3);

            isPreTestCondition = " AND sut.LearnTypeCode = @isPreTest  ";
        }


        var getDataStatement = ";WITH DataForGraph ( " +
            "Teacher, StuCode, SubjectCode, UnitID, " +
            "tmpSubjectUnitPre, LearnTypeCode, ExpectScore, " +
            "TotalScore, PeriodCode, IsDone ) " +
            "AS ( SELECT DISTINCT " +
            "( q.TchCode + ' ' + tch.TchPName + ' ' + tch.TchFName + ' ' + tch.TchLName ) Teacher ,  sut.StuCode , " +
            "sut.SubjectCode , sut.UnitID , " +
            "( sut.SubjectCode + CAST(sut.UnitID AS NVARCHAR(10)) + sut.PeriodCode ) tmpSubjectUnitPre , " +
            "sut.LearnTypeCode ,sut.ExpectScore ,  sut.TotalScore ,sut.PeriodCode ,sut.IsDone " +
            "FROM     wtuuser.tbStuUnitTest sut " +
            "JOIN wtuuser.tbStuUnitQuestion suq ON sut.Idx = suq.StuUnitTest_Idx " +
            "AND sut.PeriodCode = @periodCode " +
            isPreTestCondition +
            subjectCodeCondition +
            "JOIN wtuuser.tbQuestion q ON suq.Question_Idx = q.Idx " +
            "AND q.TchCode = @tchCode " +
            "JOIN wtuuser.tbTeacher tch ON tch.Idx = q.Teacher_Idx " +
            ") " +
            "   SELECT  " +
            "   CountZeroScore = ( SELECT   COUNT(g.StuCode) " +
            "       FROM  DataForGraph g " +
            "       WHERE  ( g.TotalScore <= g.ExpectScore*1/100  " +
            GraphModel.prototype.andConditionInTestData() +
            ") ," +

            "   CountFiftyPercent = ( SELECT    COUNT(g.StuCode) " +
            "       FROM      DataForGraph g " +
            "       WHERE     ( ( g.TotalScore > g.ExpectScore*1/100 " +
            "                   AND g.TotalScore <= g.ExpectScore*50/100 ) " +
            GraphModel.prototype.andConditionInTestData() +
            ") ," +

            "   CountEightyPercent = ( SELECT    COUNT(g.StuCode) " +
            "       FROM      DataForGraph g " +
            "       WHERE     ( ( g.TotalScore > g.ExpectScore*50/100 " +
            "                   AND g.TotalScore <= g.ExpectScore*80/100 ) " +
            GraphModel.prototype.andConditionInTestData() +
            ") ," +
            "   Count100Percent = ( SELECT    COUNT(g.StuCode) " +
            "       FROM      DataForGraph g " +
            "       WHERE     ( ( g.TotalScore > g.ExpectScore*80/100 " +
            "                   AND g.TotalScore <= g.ExpectScore*100/100 ) " +
            GraphModel.prototype.andConditionInTestData() +
            ") ," +
            " gg.Teacher , gg.SubjectCode , gg.UnitID , gg.ExpectScore , gg.tmpSubjectUnitPre , " +
            "CASE WHEN gg.LearnTypeCode = 1 THEN 'Pre-Test' " +
            "     WHEN gg.LearnTypeCode = 3 THEN 'Post-Test' END LearnTypeCode , " +
            "CASE WHEN gg.IsDone = 1 THEN 'Done' " +
            "     WHEN gg.IsDone = 0 THEN 'Not Done' END IsDone " +
            "FROM    DataForGraph gg " +
            "GROUP BY gg.SubjectCode , gg.UnitID , gg.ExpectScore , gg.tmpSubjectUnitPre , gg.Teacher , gg.LearnTypeCode , gg.IsDone " +
            "ORDER BY gg.Teacher , gg.SubjectCode ,gg.LearnTypeCode,  gg.UnitID;";


        request.query(getDataStatement).then(function (result) {

            callback(null, result);

        }).catch(function (err) {
            console.log(err.message);
            //console.log(result);
            callback(err, null);
        });
    });


};


GraphModel.prototype.andConditionInTestData = function () {

    var andCondition = " AND ( g.tmpSubjectUnitPre = gg.tmpSubjectUnitPre )) " +
        " AND ( g.LearnTypeCode = gg.LearnTypeCode  " +
        " AND g.IsDone = gg.IsDone  " +
        "AND g.ExpectScore = gg.ExpectScore ) ";
    return andCondition;

};


GraphModel.prototype.getIncreaseDecreasePercentage = function (criteria, callback) {

    var database = new Database();

    mssql.connect(database.mssqlConfig(), function (err) {

        var subjectCodeCondition = " ";

        if (err) console.log(err);

        var request = new mssql.Request();

        request.input('tchCode', mssql.NVarChar(10), criteria.tchCode);
        request.input('periodCode', mssql.NVarChar(5), criteria.periodCode);

        if (criteria.subjectCode != 0) {
            request.input('subjectCode', mssql.NVarChar(10), criteria.subjectCode);
            subjectCodeCondition = " AND sut.SubjectCode = @subjectCode  ";
        }


        var createTableVariable = "DECLARE @DataForGraph TABLE ( " +
            "Teacher NVARCHAR(255) NOT NULL , " +
            "StuCode NVARCHAR(10) NOT NULL , " +
            "SubjectCode NVARCHAR(10) NOT NULL , " +
            "UnitID INT NOT NULL , " +
            "tmpSubjectUnitPre NVARCHAR(20) NOT NULL ," +
            "LearnTypeCode INT NOT NULL , " +
            "ExpectScore INT NOT NULL , " +
            "TotalScore INT NOT NULL , " +
            "PeriodCode NVARCHAR(5) NOT NULL , " +
            "IsDone BIT NOT NULL DEFAULT 0 ) ";

        var insertDataToTableVariable = "INSERT  INTO @DataForGraph " +
            "SELECT DISTINCT ( q.TchCode + ' ' + tch.TchPName + ' ' + tch.TchFName + ' ' + tch.TchLName ) Teacher , " +
            "sut.StuCode ,sut.SubjectCode ,sut.UnitID ," +
            "( sut.SubjectCode + CAST(sut.UnitID AS NVARCHAR(10)) + sut.PeriodCode ) tmpSubjectUnitPre , " +
            "sut.LearnTypeCode ,  sut.ExpectScore , sut.TotalScore , sut.PeriodCode , sut.IsDone  " +
            "FROM  wtuuser.tbStuUnitTest sut " +
            "JOIN wtuuser.tbStuUnitQuestion suq ON sut.Idx = suq.StuUnitTest_Idx " +
            "AND sut.PeriodCode = @periodCode " +
            subjectCodeCondition +
            "AND sut.IsDone = 1 " +
            "JOIN wtuuser.tbQuestion q ON suq.Question_Idx = q.Idx " +
            "AND q.TchCode = @tchCode " +
            "JOIN wtuuser.tbTeacher tch ON tch.Idx = q.Teacher_Idx " +
            "ORDER BY sut.SubjectCode , sut.PeriodCode ,sut.UnitID ,sut.LearnTypeCode; ";

        var createTableVaribaleCoutedDataForGraph = "DECLARE @CoutedDataForGraph TABLE ( " +
            "CountFiftyPercent DECIMAL NOT NULL , " +
            "CountEightyPercent DECIMAL NOT NULL , " +
            "Count100Percent DECIMAL NOT NULL , " +
            "Teacher NVARCHAR(255) NOT NULL , " +
            "SubjectCode NVARCHAR(10) NOT NULL , " +
            "UnitID INT NOT NULL , " +
            "ExpectScore INT NOT NULL , " +
            "tmpSubjectUnitPre NVARCHAR(20) NOT NULL , " +
            "LearnTypeCode INT NOT NULL , " +
            "IsDone BIT NOT NULL DEFAULT 0 ); ";

        var insertCoutedDataToTableVariable = "INSERT  INTO @CoutedDataForGraph " +
            "SELECT  CountFiftyPercent =  ( SELECT    COUNT(g.StuCode) " +
            "                               FROM      @DataForGraph g " +
            "                               WHERE     ( ( g.TotalScore > g.ExpectScore* 1 / 100 AND g.TotalScore <= g.ExpectScore * 50 / 100) " +
            GraphModel.prototype.andConditionInTestData() +
            ") ," +
            "CountEightyPercent = ( SELECT   COUNT(g.StuCode) " +
            "                       FROM      @DataForGraph g " +
            "                       WHERE    ( ( g.TotalScore > g.ExpectScore * 50 / 100 AND g.TotalScore <= g.ExpectScore * 80 / 100) " +
            GraphModel.prototype.andConditionInTestData() +
            ") ," +
            "Count100Percent = ( SELECT   COUNT(g.StuCode) " +
            "                       FROM      @DataForGraph g " +
            "                       WHERE    ( ( g.TotalScore > g.ExpectScore * 80 / 100 AND g.TotalScore <= g.ExpectScore * 100 / 100) " +
            GraphModel.prototype.andConditionInTestData() +
            ") ," +
            "gg.Teacher , gg.SubjectCode , gg.UnitID , gg.ExpectScore ," +
            "gg.tmpSubjectUnitPre ,  gg.LearnTypeCode , gg.IsDone " +
            "FROM    @DataForGraph gg " +
            "GROUP BY gg.SubjectCode , gg.UnitID ,gg.ExpectScore , " +
            "gg.tmpSubjectUnitPre , gg.Teacher , gg.LearnTypeCode , gg.IsDone " +
            "ORDER BY gg.Teacher ,  gg.SubjectCode , gg.UnitID;  ";

        var getDataStatement = "SELECT DISTINCT " +
            " COALESCE(100 * ( curr.CountFiftyPercent - prev.CountFiftyPercent ) / NULLIF(prev.CountFiftyPercent, 0), 0) AS FiftyPercentDiff , " +
            "COALESCE(100 * ( curr.CountEightyPercent - prev.CountEightyPercent ) / NULLIF(prev.CountEightyPercent, 0), 0) AS EightyPercentDiff ," +
            "COALESCE(100 * ( curr.Count100Percent - prev.Count100Percent ) / NULLIF(prev.Count100Percent, 0), 0) AS HundredPercentDiff , " +
            "curr.Teacher , curr.SubjectCode , curr.UnitID ," +
            "curr.ExpectScore , curr.LearnTypeCode , curr.tmpSubjectUnitPre " +
            "FROM    @CoutedDataForGraph curr " +
            "JOIN @CoutedDataForGraph prev ON curr.LearnTypeCode = 3 " +
            "AND prev.LearnTypeCode = 1 " +
            "AND curr.tmpSubjectUnitPre = prev.tmpSubjectUnitPre " +
            " AND curr.ExpectScore = prev.ExpectScore " +
            "AND curr.IsDone = 1 " +
            " AND prev.IsDone = 1 " +
            "ORDER BY curr.SubjectCode , " +
            "curr.UnitID , " +
            "curr.ExpectScore , " +
            "curr.tmpSubjectUnitPre; ";


        request.query(createTableVariable + insertDataToTableVariable +
            createTableVaribaleCoutedDataForGraph + insertCoutedDataToTableVariable +
            getDataStatement).then(function (result) {

            callback(null, result);

        }).catch(function (err) {
            console.log(err.message);
            //console.log(result);
            callback(err, null);
        });
    });

};

module.exports = GraphModel;
