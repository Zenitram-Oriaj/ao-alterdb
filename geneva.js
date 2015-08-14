/**
 * Created by Jairo Martinez on 8/14/15.
 */


var fs = require('fs');
var _cfg = {};

try {
	fs.openSync(__dirname + "/configs/gateway.json", 'r');
	_cfg = JSON.parse(fs.readFileSync(__dirname + "/configs/gateway.json"));
}
catch (err) {
	_cfg = JSON.parse(fs.readFileSync(__dirname + "/configs/default.json"));
}

var async = require('async');
var mysql = require('mysql');
var sqlApp = require('./app/gbc');
var _comms = {};

function _collectCtrls(cb){
	cb = (typeof cb === 'function') ? cb : function () {
	};

	try {
		var q = 'SELECT * FROM `' + _cfg.db.schema + '`.controllers;';
		_comms.query(q, function (err, dat) {
			if (err) {
				cb(err, null);
			} else {
				cb(null, dat);
			}
		});
	}
	catch (ex) {
		cb(ex, null);
	}
}
function _add(cb) {
	cb = (typeof cb === 'function') ? cb : function () {};

	try {
		var q = "ALTER TABLE `" + _cfg.db.schema + "`.`controllerEvents` ADD COLUMN `millis` INT(22) NULL DEFAULT 0 AFTER `duration`;";
		_comms.query(q, function (err, dat) {
			if (err) {
				cb(err, null);
			} else {
				cb(null, dat);
			}
		});
	}
	catch(ex){
		cb(ex,null);
	}
}

function _remove(cb){
	cb = (typeof cb === 'function') ? cb : function () {};

	try {
		var q = "ALTER TABLE `" + _cfg.db.schema + "`.`controllerEvents` " +
			"DROP COLUMN `processedAt`, " +
			"DROP COLUMN `retries`, " +
			"DROP COLUMN `prior`, " +
			"CHANGE COLUMN `event` `event` VARCHAR(45) NULL DEFAULT 'WAITING' AFTER `uuid`, " +
			"CHANGE COLUMN `state` `state` VARCHAR(45) NULL DEFAULT 'unknown', " +
			"CHANGE COLUMN `duration` `duration` VARCHAR(45) NULL DEFAULT '00:00:00';";

		_comms.query(q, function (err, dat) {
			if (err) {
				cb(err, null);
			} else {
				cb(null, dat);
			}
		});
	}
	catch(ex){
		cb(ex,null);
	}
}

function _run(ct,cb){
	cb = (typeof cb === 'function') ? cb : function () {
	};

	try {
		var sq = new sqlApp();
		sq.init(_cfg,ct.uuid,function(err,res){
			cb(err,res);
		});
	}
	catch(ex){
		cb(ex,null);
	}
}

function _init() {
	try {
		_comms = mysql.createConnection({
			host:     _cfg.db.ip,
			port:     _cfg.db.port,
			user:     _cfg.db.user,
			password: _cfg.db.pass,
			database: _cfg.db.schema
		});

		_comms.connect(function(err){
			if(err){
				console.error('----- CONNECTION ERROR OCCURRED -----');
				console.error(err);
			} else {
				_add(function(err,res){
					if(err){
						console.error('----- "_add" ERROR OCCURRED -----');
						console.error(err);
					} else {
						_collectCtrls(function(err,cts){
							if(err){
								console.error('----- COLLECT CONTROLLERS ERROR OCCURRED -----');
								console.error(err);
							} else {
								async.mapSeries(cts,_run,function(err,res){
									if(err){
										console.error('----- "_run" ERROR OCCURRED -----');
										console.error(err);
									} else {
										_remove(function () {
											if(err){
												console.error('----- "_remove" ERROR OCCURRED -----');
												console.error(err);
											}
											_comms.destroy();
											console.log('----- OPERATION COMPLETED -----');
										});
									}
								})
							}
						});
					}
				});
			}
		});
	}
	catch (ex) {
		console.error('----- EXCEPTION OCCURRED -----');
		console.error(ex);
	}
}

_init();