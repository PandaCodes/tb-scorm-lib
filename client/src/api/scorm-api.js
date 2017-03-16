  // predefined constants
const LMSVersion = '1.0';
const	errorStrings = {
  0: 'No error',
    // General Errors 100-199
  101: 'General Exception',
  102: 'General Initialization Failure',
  103: 'Already Initialized',
  104: 'Content Instance Terminated',
  111: 'General Termination Failure',
  112: 'Termination Before Initialization',
  113: 'Termination After Termination',
  122: 'Retrieve Data Before Initialization',
  123: 'Retrieve Data After Termination',
  132: 'Store Data Before Initialization',
  133: 'Store Data After Termination',
  142: 'Commit Before Initialization',
  143: 'Commit After Termination',
    // Syntax Errors 200-299
  201: 'General Argument Error',
    // RTS (LMS) Errors 300-399
  301: 'General Get Failure',
  351: 'General Set Failure',
  391: 'General Commit Failure',
    // Data Model Errors 400-499
  401: 'Undefined Data Model Element',
  402: 'Unimplemented Data Model Element',
  403: 'Data Model Element Value Not Initialized',
  404: 'Data Model Element Is Read Only',
  405: 'Data Model Element Is Write Only',
  406: 'Data Model Element Type Mismatch',
  407: 'Data Model Element Value Out Of Range',
  408: 'Data Model Dependency Not Established',
    // Implementation-defined Errors 1000-65535
  1000: 'General communication failure',
};
const functionNames = {
  2004: {
    Initialize: 'Initialize',
    Terminate: 'Terminate',
    GetValue: 'GetValue',
    SetValue: 'SetValue',
    Commit: 'Commit',
    GetLastError: 'GetLastError',
    GetErrorString: 'GetErrorString',
    GetDiagnostic: 'GetDiagnostic',
  },
  1.2: {
    Initialize: 'LMSInitialize',
    Terminate: 'LMSFinish',
    GetValue: 'LMSGetValue',
    SetValue: 'LMSSetValue',
    Commit: 'LMSCommit',
    GetLastError: 'LMSGetLastError',
    GetErrorString: 'LMSGetErrorString',
    GetDiagnostic: 'LMSGetDiagnostic',
  },
};
const	STATE = {
  NOT_INITIALIZED: 'Not Initialized',
  RUNNING: 'Running',
  TERMINATED: 'Terminated',
};
const cmiDefault = {
  'cmi._version': LMSVersion,
  'cmi.mode': 'normal',
  'cmi.credit': 'no-credit',
  'cmi.entry': 'ab-initio',
  'cmi.location': '',
  'cmi.success_status': 'unknown',
  'cmi.completion_status': 'incomplete',
  'cmi.score._children': 'scaled,min,max,raw',
  'cmi.interactions._children': '',
    // "id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description",
  'cmi.interactions._count': '0',
};

let needLogging = false;
let state = null;
let error = 0;
let cmi = null;
let changedValues = {};

const valueNameSecurityCheckRe = /^(cmi||adl)\.(\w|\.)+$/;

  // help functions
const _stringEndsWith = (str, suffix) => str.length >= suffix.length && str.substr(str.length - suffix.length) == suffix;
const valueNameSecurityCheck = (name) => {
  error = name.search(valueNameSecurityCheckRe) === 0 ? 0 : 401;
  return error === 0;
};
const valueNameCheckReadOnly = (name) => {
  error = 0;
  if (_stringEndsWith(name, '._children')) {
    error = 403;
  }
  return error === 0;
};
const checkRunning = (errBefore, errAfter) => {
  if (state === STATE.NOT_INITIALIZED) {
    error = errBefore;
  } else if (state === STATE.TERMINATED) {
    error = errAfter;
  } else {
    error = 0;
  }
  return error === 0;
};
const post = (dataUrl, body) => 
  dataUrl 
  ? fetch(dataUrl, { method: 'POST', body })
  : Promise.resolve();
const log = (...args) => {
  if (needLogging && console) {
    console.log(...args);
  }
};

export default {
  init({
    dataUrl,
    version = '2004',
    debug = false,
    autoCommitInterval = -1, // in seconds
    callbacks,
    modelInit,
  }){
    // Pre init
    state = STATE.NOT_INITIALIZED;
    needLogging = debug === true;
  
    // clone default cmi
    // or download the old one
    cmi = Object.assign({}, cmiDefault, modelInit);
    const initCmi = dataUrl ?
      fetch(dataUrl)
      .then(responce => responce.json())
      .then(json => JSON.parse(json))
      .then((storedCmi) => {
        log('Fetched cmi from server', storedCmi);
        cmi = Object.assign({}, cmiDefault, storedCmi);
      }).catch(log)
      : Promise.resolve();
  
    return initCmi.then(() => {
      if (callbacks && callbacks.preInitialize) { callbacks.preInitialize(); }
  
      const fnms = version === '1.2' ? functionNames['1.2'] : functionNames['2004'];
      const API = {};
  
      // auto commit
      let lastCommit = Date.now();
      let commitInterval = null;
      if (typeof autoCommitInterval === 'number' && autoCommitInterval > 0) {
        log('Auto-commit enabled');
        commitInterval = setInterval(() => {
          console.log('Ai');// ?? TODO
          const now = Date.now();
          if (now - lastCommit > autoCommitInterval * 1000) {
            API[fnms.Commit]();
          }
        }, autoCommitInterval * 1000 / 2);
      }
  
        // SCO RTE functions
      API[fnms.Initialize] = () => {
        log('LMS Initialize');
        if (state === STATE.RUNNING) {
          error = 103;
          return 'false';
        }
        if (state === STATE.TERMINATED) {
          error = 103;
          return 'false';
        }
        state = STATE.RUNNING;
        error = 0;
        let callbackResult = 'true';
        if (callbacks && callbacks.onInitialize) { callbackResult = callbacks.onInitialize(); }
        if (callbackResult === 'false') return 'false';
  
        return 'true';
      };
  
      API[fnms.Terminate] = () => {
        log('LMS Terminate');
        if (!checkRunning(112, 113)) return 'false';
  
  
        // ugly?
        if (changedValues["cmi.exit"] === "") { post(dataUrl, {}).catch(log); }
        if (changedValues["cmi.exit"] === "suspend") {
          changedValues["cmi.entry"] = "resume";
          API[fnms.Commit]();
        }
        //other? TODO
        
        state = STATE.TERMINATED;
        clearInterval(commitInterval);
  
        let callbackResult = 'true';
        if (callbacks && callbacks.onTerminate) { callbackResult = callbacks.onTerminate(); }
        if (callbackResult === 'false') return 'false';
  
        return 'true';
      };
  
      API[fnms.GetValue] = (name) => {
        log('LMS GetValue', name);
        if (!checkRunning(122, 123)) {
          return '';
        }
        if (!valueNameSecurityCheck(name)) return '';
  
        let retval = cmi[name];
        if (typeof (retval) === 'undefined') {
          retval = '';
        }
  
        log('LMS GetValue return: ', retval);
        return retval;
      };
  
      API[fnms.SetValue] = (name, value) => {
        log('LMS SetValue', name, value);
        if (!checkRunning(132, 133)) return 'false';
        if (!valueNameSecurityCheck(name)) return 'false';
        if (!valueNameCheckReadOnly(name)) return 'false';
  
        changedValues[name] = value;
        return 'true';
      },
  
      API[fnms.Commit] = () => {
        log('LMS Commit', changedValues);
        if (!checkRunning(142, 143)) return 'false';
  
        Object.assign(cmi, changedValues);
        // TODO: Errors (like "Bad connection, sorry..")
        post(dataUrl, JSON.stringify(cmi)).catch(log);
  
        let callbackResult = 'true';
        if (callbacks && callbacks.onCommit) { callbackResult = callbacks.onCommit(); }
        if (callbackResult === 'false') return 'false';
  
        lastCommit = Date.now();
        changedValues = {}; // clean changed values
        return 'true';
       };
  
      API[fnms.GetDiagnostic] = (errCode) => {
        log('LMS GetDiagnostic', errCode);
        if (!errCode) return API[fnms.GetLastError]();
        return errorStrings[errCode] ? errorStrings[errCode] : 'Uknown errCode.';
      };
  
      API[fnms.GetErrorString] = (errCode) => {
        log('LMS GetErrorString', errCode);
        return errorStrings[errCode] ? errorStrings[errCode] : '';
      };
  
      API[fnms.GetLastError] = () => {
        if (error !== 0) log('LMS GetLastError return', error);
        return error;
      };
  
        // global api object set
      if (version === '1.2') {
        window.API = API;
      } else {
        window.API_1484_11 = API;
      }
    });
  },
  
  getDataModel : () => Object.assign({}, cmi)

  
};

