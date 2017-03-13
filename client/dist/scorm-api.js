"use strict";

window.SCORMApi = function () {
	// predefined constants
	var LMSVersion = "1.0";
	var error_strings = {
		0: "No error",
		// General Errors 100-199
		101: "General Exception",
		102: "General Initialization Failure",
		103: "Already Initialized",
		104: "Content Instance Terminated",
		111: "General Termination Failure",
		112: "Termination Before Initialization",
		113: "Termination After Termination",
		122: "Retrieve Data Before Initialization",
		123: "Retrieve Data After Termination",
		132: "Store Data Before Initialization",
		133: "Store Data After Termination",
		142: "Commit Before Initialization",
		143: "Commit After Termination",
		// Syntax Errors 200-299
		201: "General Argument Error",
		// RTS (LMS) Errors 300-399
		301: "General Get Failure",
		351: "General Set Failure",
		391: "General Commit Failure",
		// Data Model Errors 400-499
		401: "Undefined Data Model Element",
		402: "Unimplemented Data Model Element",
		403: "Data Model Element Value Not Initialized",
		404: "Data Model Element Is Read Only",
		405: "Data Model Element Is Write Only",
		406: "Data Model Element Type Mismatch",
		407: "Data Model Element Value Out Of Range",
		408: "Data Model Dependency Not Established",
		// Implementation-defined Errors 1000-65535
		1000: "General communication failure (Ajax)"
	};
	var functionNames = {
		'2004': {
			'Initialize': 'Initialize',
			'Terminate': 'Terminate',
			'GetValue': 'GetValue',
			'SetValue': 'SetValue',
			'Commit': 'Commit',
			'GetLastError': 'GetLastError',
			'GetErrorString': 'GetErrorString',
			'GetDiagnostic': 'GetDiagnostic'
		},
		'1.2': {
			'Initialize': 'LMSInitialize',
			'Terminate': 'LMSFinish',
			'GetValue': 'LMSGetValue',
			'SetValue': 'LMSSetValue',
			'Commit': 'LMSCommit',
			'GetLastError': 'LMSGetLastError',
			'GetErrorString': 'LMSGetErrorString',
			'GetDiagnostic': 'LMSGetDiagnostic'
		}
	};
	var STATE = {
		NOT_INITIALIZED: "Not Initialized",
		RUNNING: "Running",
		TERMINATED: "Terminated"
	};
	var cmiDefault = {
		"cmi._version": LMSVersion,
		"cmi.mode": "normal",
		"cmi.credit": "no-credit",
		"cmi.entry": "ab-initio",
		"cmi.location": "",
		"cmi.success_status": "unknown",
		"cmi.completion_status": "incomplete",
		"cmi.score._children": "scaled,min,max,raw",
		"cmi.interactions._children": "", //"id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description",
		"cmi.interactions._count": "0"
	};

	var needLogging = false;
	var state = null;
	var error = 0;
	var cmi = null;
	var _valuesChanged = {};

	var _valueNameSecurityCheckRe = /^(cmi||adl)\.(\w|\.)+$/;

	// help functions
	var _stringEndsWith = function _stringEndsWith(str, suffix) {
		return str.length >= suffix.length && str.substr(str.length - suffix.length) == suffix;
	};
	var _valueNameSecurityCheck = function _valueNameSecurityCheck(name) {
		error = name.search(_valueNameSecurityCheckRe) === 0 ? 0 : 401;
		return error === 0;
	};
	var _valueNameCheckReadOnly = function _valueNameCheckReadOnly(name) {
		error = 0;
		if (_stringEndsWith(name, "._children")) {
			error = 403;
		}
		return error === 0;
	};
	var _checkRunning = function _checkRunning(errBefore, errAfter) {
		if (state === STATE.NOT_INITIALIZED) {
			error = errBefore;
		} else if (state === STATE.TERMINATED) {
			error = errAfter;
		} else {
			error = 0;
		}
		return error === 0;
	};
	var _log = function _log() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		if (needLogging && console) {
			console.log.apply(console, args);
		}
	};

	var init = function init(_ref) {
		var postUrl = _ref.postUrl,
		    _ref$version = _ref.version,
		    version = _ref$version === undefined ? '2004' : _ref$version,
		    _ref$debug = _ref.debug,
		    debug = _ref$debug === undefined ? false : _ref$debug,
		    _ref$autoCommit = _ref.autoCommit,
		    autoCommit = _ref$autoCommit === undefined ? false : _ref$autoCommit,
		    callbacks = _ref.callbacks;

		//Pre init
		state = STATE.NOT_INITIALIZED;
		needLogging = debug === true ? true : false;
		// set cmi - clone default cmi
		cmi = Object.assign({}, cmiDefault);
		if (callbacks && callbacks.preInitialize) {
			callbacks.preInitialize();
		}

		var fnms = version === '1.2' ? functionNames['1.2'] : functionNames['2004'];
		var API = {};

		// SCO RTE functions
		API[fnms['Initialize']] = function () {
			_log("LMS Initialize");
			if (state === STATE.RUNNING) {
				error = 103;
				return "false";
			}
			if (state === STATE.TERMINATED) {
				error = 103;
				return "false";
			}
			state = STATE.RUNNING;
			error = 0;

			return "true";
		};

		API[fnms['Terminate']] = function () {
			_log("LMS Terminate");
			if (!_checkRunning(112, 113)) return "false";

			this[fnms['Commit']](); //?
			state = STATE.TERMINATED;

			return "true";
		};

		API[fnms['GetValue']] = function (name) {
			_log("LMS GetValue", name);
			if (!_checkRunning(122, 123)) {
				return "";
			}
			if (!_valueNameSecurityCheck(name)) return "";

			var retval = cmi[name];
			if (typeof retval == "undefined") {
				retval = "";
			}

			_log("LMS GetValue return: ", retval);
			return retval;
		};

		API[fnms['SetValue']] = function (name, value) {
			_log("LMS SetValue", name, value);
			if (!_checkRunning(132, 133)) return "false";
			if (!_valueNameSecurityCheck(name)) return "false";
			if (!_valueNameCheckReadOnly(name)) return "false";

			_valuesChanged[name] = value;
			return "true";
		}, API[fnms['Commit']] = function () {
			_log("LMS Commit", _valuesChanged);
			if (!_checkRunning(142, 143)) return "false";
			Object.assign(cmi, _valuesChanged);

			_log(cmi);
			if (postUrl) {
				fetch(postUrl, { method: 'POST', body: JSON.stringify(cmi) }).catch(function (e) {
					return error = 1000;
				});
			}
			if (callbacks && callbacks.Commit) {
				callbacks.Commit(cmi);
			}

			_valuesChanged = {}; // clean changed values
			return "true";
		};

		API[fnms['GetDiagnostic']] = function (errCode) {
			_log("LMS GetDiagnostic", errCode);
			// if (!errCode) return this.GetLastError();
			return error_strings[errCode] ? error_strings[errCode] : 'Uknown errCode.';
		};

		API[fnms['GetErrorString']] = function (errCode) {
			_log("LMS GetErrorString", errCode);
			return error_strings[errCode] ? error_strings[errCode] : '';
		};

		API[fnms['GetLastError']] = function () {
			if (error != 0) _log("LMS GetLastError return", error);
			return error;
		};

		if (version === '1.2') {
			window.API = API;
		} else {
			window.API_1484_11 = API;
		}
	};

	return { init: init };
}();