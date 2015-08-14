/**
 * Created by Jairo Martinez on 8/13/15.
 */

var path = require('path');
var fs = require('fs');
var srvrDir = path.resolve(__dirname, '..');
var config = {};

try {
	fs.openSync(__dirname + "/configs/gateway.json", 'r');
	config = JSON.parse(fs.readFileSync(srvrDir + "/configs/config.json"));
}
catch (err) {
	config = JSON.parse(fs.readFileSync(srvrDir + "/configs/default.json"));
}

var dbg = false;

if(config.db.debug) {
	dbg = console.log;
}

var Sequelize = require('sequelize');
var lodash = require('lodash');

function GetTimeZoneOffset(){
	var dts = new Date();
	var tzo = (dts.getTimezoneOffset() / 60);
	var str = '00:00';
	if(tzo <= 0){
		tzo = Math.abs(tzo);
	} else {
		tzo = Math.abs(tzo) * -1;
	}

	if(tzo > -10 && tzo < 10) {
		if(tzo < 0){
			str = '-0' + Math.abs(tzo).toString() + ':00';
		} else {
			str = '+0' + tzo.toString() + ':00';
		}
	} else {
		str = tzo.toString + ':00';
	}
	return str;
}

var sequelize = new Sequelize(config.db.schema, config.db.user, config.db.pass, {
	host:     config.db.ip,
	dialect:  config.db.dialect,
	port:     config.db.port,
	logging:  dbg,
	timezone: GetTimeZoneOffset()
});

var rootDir = __dirname + '/models';

var db = {};

sequelize.authenticate().then(
	function(res){

	},
	function(err){
		log.UpdateSysLog('admin', 'error', 'Unable To Connect To The DB :: ' + err);
	});


fs.readdirSync(rootDir)
	.filter(function (file) {
		return (file.indexOf('.') !== 0) && (file !== 'index.js')
	})
	.forEach(function (file) {
		var model = sequelize.import(path.join(rootDir, file));
		db[model.name] = model;
	});

Object.keys(db).forEach(function (modelName) {
	if ('associate' in db[modelName]) {
		db[modelName].associate(db)
	}
});

module.exports = lodash.extend({
	sequelize: sequelize,
	Sequelize: Sequelize
}, db);