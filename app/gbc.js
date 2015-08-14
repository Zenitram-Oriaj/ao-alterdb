/**
 * Created by Jairo Martinez on 8/14/15.
 */

var async = require('async');
var mysql = require('mysql');
var _comms = {};
var _cfg = {};

var sqlApp = function () {
};

function _msToTime(milli) {
	var seconds = Math.floor((milli / 1000) % 60);
	var minutes = Math.floor((milli / (60 * 1000)) % 60);
	var hours = Math.floor((milli / (60 * 60 * 1000)) % 60);

	if (hours < 10) hours = '0' + hours.toString();
	if (minutes < 10) minutes = '0' + minutes.toString();
	if (seconds < 10) seconds = '0' + seconds.toString();

	return hours.toString() + ":" + minutes.toString() + ":" + seconds.toString();
}

var _fixDurations = function (obj, cb) {
	try {
		var q = "SELECT * FROM `" + _cfg.db.schema + "`.controllerEvents WHERE `uuid` = '" + obj.uuid + "' AND `id` > " + (obj.id - 1) + " LIMIT 2;";
		_comms.query(q, function (err, et) {
			if (err) {
				cb(err, null);
			} else {
				var e1 = et[0];
				var e2 = et[1] || { createdAt: new Date() };

				var d1 = new Date(e1.createdAt);
				var d2 = new Date(e2.createdAt);
				var millis = d2 - d1;
				var duration = _msToTime(millis);
				var dt = new Date();

				var r =  "UPDATE `" + _cfg.db.schema + "`.`controllerEvents` SET" +
					" `duration`='" + duration + "'" +
					", `millis` = '" + millis + "'" +
					", `state` = '" + e1.event + "'" +
					", `event` = 'COMPLETE'" +
					" WHERE `id`='" + e1.id + "'";

				console.log(r);

				_comms.query(r, function (err, res) {
					cb(err,res);
				});
			}
		});
	}
	catch (ex) {
		setTimeout(function(){
			cb(ex,null);
		},1);
	}
};

var _collectCtrlEvtsAndFix = function (uuid, cb) {
	cb = (typeof cb === 'function') ? cb : function () {
	};

	try {
		var q = "SELECT * FROM `" + _cfg.db.schema + "`.controllerEvents WHERE `uuid` = '" + uuid + "' ORDER BY `id` ASC;";
		_comms.query(q, function (err, evts) {
			if (err) {
				setTimeout(function () {
					cb(err, null);
				}, 1);
			} else {
				if (evts && evts.length > 1) {
					var ids = [];

					for (var z in evts) {
						ids.push({
							id:   evts[z].id,
							uuid: evts[z].uuid
						});
					}

					async.mapSeries(ids, _fixDurations, function (err, res) {
						cb(err, res);
					});

				} else {
					setTimeout(function () {
						cb(null, {});
					}, 1);
				}
			}
		});
	}
	catch (ex) {
		setTimeout(function () {
			cb(ex, null);
		}, 1);
	}
};

sqlApp.prototype.init = function (cfg, uuid, cb) {
	cb = (typeof cb === 'function') ? cb : function () {
	};

	try {
		_cfg = cfg;

		_comms = mysql.createConnection({
			host:     _cfg.db.ip,
			port:     _cfg.db.port,
			user:     _cfg.db.user,
			password: _cfg.db.pass,
			database: _cfg.db.schema
		});

		_comms.connect(function (err) {
			if (err) {
				cb(err, null);
			} else {
				_collectCtrlEvtsAndFix(uuid, function (err, res) {
					_comms.destroy();
					cb(err, res);
				});
			}
		});
	}
	catch (ex) {
		setTimeout(function(){
			cb(ex, null);
		},1);

	}
};

module.exports = sqlApp;