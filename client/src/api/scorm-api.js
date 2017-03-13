window.SCORMApi = (function(){
	// predefined constants
	const LMSVersion = "1.0";

	const	error_strings = {
		0 : "No error",
		// General Errors 100-199
		101 : "General Exception",
		102 : "General Initialization Failure",
		103 : "Already Initialized",
		104 : "Content Instance Terminated",
		111 : "General Termination Failure",
		112 : "Termination Before Initialization",
		113 : "Termination After Termination",
		122 : "Retrieve Data Before Initialization",
		123 : "Retrieve Data After Termination",
		132 : "Store Data Before Initialization",
		133 : "Store Data After Termination",
		142 : "Commit Before Initialization",
		143 : "Commit After Termination",
		// Syntax Errors 200-299
		201 : "General Argument Error",
		// RTS (LMS) Errors 300-399
		301 : "General Get Failure",
		351 : "General Set Failure",
		391 : "General Commit Failure",
		// Data Model Errors 400-499
		401 : "Undefined Data Model Element",
		402 : "Unimplemented Data Model Element",
		403 : "Data Model Element Value Not Initialized",
		404 : "Data Model Element Is Read Only",
		405 : "Data Model Element Is Write Only",
		406 : "Data Model Element Type Mismatch",
		407 : "Data Model Element Value Out Of Range",
		408 : "Data Model Dependency Not Established",
		// Implementation-defined Errors 1000-65535
		1000 : "General communication failure (Ajax)"
	};
	const functionNames = {
		'2004' : {
			'Initialize' : 'Initialize',
			'Terminate' : 'Terminate', 
			'GetValue' : 'GetValue',
			'SetValue' : 'SetValue',
			'Commit' : 'Commit',
			'GetLastError' : 'GetLastError', 
			'GetErrorString' : 'GetErrorString',
			'GetDiagnostic' : 'GetDiagnostic'
		},
		'1.2' : {
			'Initialize' : 'LMSInitialize',
			'Terminate' : 'LMSFinish', 
			'GetValue' : 'LMSGetValue',
			'SetValue' : 'LMSSetValue',
			'Commit' : 'LMSCommit',
			'GetLastError' : 'LMSGetLastError', 
			'GetErrorString' : 'LMSGetErrorString',
			'GetDiagnostic' : 'LMSGetDiagnostic'
		}
	};
	const	STATE = {
		NOT_INITIALIZED : "Not Initialized",
		RUNNING : "Running",
		TERMINATED : "Terminated"
	};
	const cmiDefault = {
		"cmi._version" : LMSVersion,
		"cmi.mode" : "normal",
		"cmi.credit" : "no-credit",
		"cmi.entry" : "ab-initio",
		"cmi.location" : "",
		"cmi.success_status" : "unknown",
		"cmi.completion_status" : "incomplete",
		"cmi.score._children" : "scaled,min,max,raw",
		"cmi.interactions._children" : "", 
		//"id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description",
		"cmi.interactions._count" : "0"
	};
	
	let needLogging = false;
	let state = null;
	let error = 0;
	let cmi = null;
	let _valuesChanged = {};
	
	const _valueNameSecurityCheckRe = /^(cmi||adl)\.(\w|\.)+$/;
	
	// help functions
	const _stringEndsWith = function(str, suffix) {
		return str.length >= suffix.length && str.substr(str.length - suffix.length) == suffix;
	};
	const _valueNameSecurityCheck = function(name) {
		error = name.search(_valueNameSecurityCheckRe) === 0 ? 0 : 401;
		return error === 0;
	};
	const _valueNameCheckReadOnly = function(name) {
		error = 0;
		if (_stringEndsWith(name, "._children")) {
			error = 403;
		}
		return error === 0;
	};
	const _checkRunning = function(errBefore, errAfter) {
		if (state === STATE.NOT_INITIALIZED) {
			error = errBefore;
		} else if (state === STATE.TERMINATED) {
			error = errAfter;
		} else {
			error = 0;
		}
		return error === 0;
	};
	const _log = (...args) => {
		if (needLogging && console) {
			console.log.apply(console, args);
		}
	};
	
	
	const init = ({ 
		postUrl, 
		version = '2004',
		debug = false,
		autoCommitInterval = -1, //in seconds
		callbacks
	}) => {
		//Pre init
		state = STATE.NOT_INITIALIZED;
		needLogging = debug === true ? true : false;
		
		// clone default cmi
		cmi = Object.assign({}, cmiDefault); 
		if (callbacks && callbacks.preInitialize) { callbacks.preInitialize(); }
		
		const fnms = version === '1.2' ? functionNames['1.2'] : functionNames['2004'];
		const API = {};
		
		let lastCommit = Date.now();
		if (typeof autoCommitInterval === "number"  && autoCommitInterval > 0) {
			setInterval(() => {
				const now = Date.now();
				if (now - lastCommit > autoCommitInterval * 1000) {
					API[fnms['Commit']]();
				}
			}, autoCommitInterval * 1000 / 2)
		}
		
		// SCO RTE functions
		API[fnms['Initialize']] = function() {
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
	
		API[fnms['Terminate']] = function() {
			_log("LMS Terminate");
			if (!_checkRunning(112, 113)) return "false";
	
			this[fnms['Commit']](); //?
			state = STATE.TERMINATED;
			
			return "true";
		};
	
	  API[fnms['GetValue']] = function(name) {
			_log("LMS GetValue", name);
			if (!_checkRunning(122, 123)) {
				return "";
			}
			if (!_valueNameSecurityCheck(name)) return "";
	
			let retval = cmi[name];
			if (typeof (retval) == "undefined") {
				retval = "";
			}
	
			_log("LMS GetValue return: ", retval);
			return retval;
		};
	
		API[fnms['SetValue']] =  function(name, value) {
			_log("LMS SetValue", name, value);
			if (!_checkRunning(132, 133)) return "false";
			if (!_valueNameSecurityCheck(name)) return "false";
			if (!_valueNameCheckReadOnly(name)) return "false";
	
			_valuesChanged[name] = value;
			return "true";
		},
	
		API[fnms['Commit']] =  function() {
			_log("LMS Commit", _valuesChanged);
			if (!_checkRunning(142, 143)) return "false";
			Object.assign(cmi, _valuesChanged);
//TODO: Promise, errors				
			if (postUrl) {
				fetch(postUrl, { method: 'POST', body: JSON.stringify(cmi) })
				.catch(e => error = 1000);
			}
			if (callbacks && callbacks.Commit) { callbacks.Commit(cmi); }
			lastCommit = Date.now();

			_valuesChanged = {}; // clean changed values
			return "true";
		};
	
		API[fnms['GetDiagnostic']] =  function(errCode) {
			_log("LMS GetDiagnostic", errCode);
			// if (!errCode) return this.GetLastError();
			return error_strings[errCode] ? error_strings[errCode] : 'Uknown errCode.';
		};
	
		API[fnms['GetErrorString']] =  function(errCode) {
			_log("LMS GetErrorString", errCode);
			return error_strings[errCode] ? error_strings[errCode] : '';
		};
	
		API[fnms['GetLastError']] =  function() {
			if (error != 0) _log("LMS GetLastError return", error);
			return error;
		};
		
		if (version === '1.2') {
			window.API = API;
		} else {
			window.API_1484_11 = API;
		}
		
	};
	
	
  return { init };
}());

