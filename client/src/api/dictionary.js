import pkg from '../../package.json'; // path resolve?

let schema = '2004';

export const setSchemaVersion = (sv) => {
  schema = sv === '1.2' ? '1.2' : '2004';
};

const cmiDefault = {
  1.2: {
    'cmi.core.lesson_mode': 'normal',
    // 'cmi.core.credit': 'credit',
    'cmi.core.entry': 'ab-initio',
    'cmi.core.lesson_status': 'not attempted',
    'cmi.core.lesson_location': '',
  },
  2004: {
    'cmi._version': pkg.version,
    'cmi.mode': 'normal',
    // 'cmi.credit': 'credit',
    'cmi.entry': 'ab-initio',
    'cmi.success_status': 'unknown',
    'cmi.completion_status': 'not attempted',
    'cmi.location': '',
    // 'cmi.interactions._count': '0',
    //'cmi.objectives._count': '4',
  },
};
export const getCmiDefault = () => cmiDefault[schema];

const errorCodes = {
  1.2: {

  },
  2004: {
    0: 0,
      // General Errors 100-199
    101: 101,
    102: 102,
    103: 103,
    104: 104,
    111: 111,
    112: 112,
    113: 113,
    122: 122,
    123: 123,
    132: 132,
    133: 133,
    142: 142,
    143: 143,
      // Syntax Errors 200-299
    201: 201,
      // RTS (LMS) Errors 300-399
    301: 301,
    351: 351,
    391: 391,
      // Data Model Errors 400-499
    401: 401,
    402: 402,
    403: 403,
    404: 404,
    405: 405,
    406: 406,
    407: 407,
    408: 408,
      // Implementation-defined Errors 1000-65535
    1000: 1000,
  },
};

const errorStrings = {
  1.2: {
    0: 'No error',
  },
  2004: {
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
  },
};
export const getErrorStrings = () => errorStrings[schema];

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
export const getFunctionNames = () => functionNames[schema];

const cmiNames = {
  1.2: {
    session_time: 'cmi.core.session_time',
    score_raw: 'cmi.core.score.raw',
    score_max: 'cmi.core.score.max',
    score_min: 'cmi.core.score.min',
    total_time: 'cmi.core.total_time',

  },
  2004: {
    // cmi.core._children : (student_id, student_name, lesson_location, credit, lesson_status, entry, score, total_time, lesson_mode, exit, session_time, RO) Listing of supported data model elements
    'cmi.core.student_id': 'cmi.learner_id', // RO
    'cmi.core.student_name': 'cmi.learner_name', // RO
    'cmi.core.lesson_location': 'cmi.location', // RW
    'cmi.core.credit': 'cmi.credit', // RO
    'cmi.core.lesson_status': 'cmi.completion_status', // RW
    // cmi.completion_status (“completed”, “incomplete”, “not attempted”, “unknown”, RW) Indicates whether the learner has completed the SCO
    // mi.core.lesson_status (“passed”, “completed”, “failed”, “incomplete”, “browsed”, “not attempted”, RW) Indicates whether the learner has completed and satisfied the requirements for the SCO
    'cmi.core.entry': 'cmi.entry',  // RO
    // (“ab-initio”, “resume”, “”, RO) Asserts whether the learner has previously accessed the SCO
    // (ab_initio, resume, “”, RO)
    'cmi.core.score_children': 'cmi.score._children', // RO
    // (raw,min,max, RO) Listing of supported data model elements
    // (scaled,raw,min,max, RO) Listing of supported data model elements
    'cmi.core.score.raw': 'cmi.score.raw', // RW
    'cmi.core.score.max': 'cmi.score.max', // RW
    'cmi.core.score.min': 'cmi.score.min', // RW
    'cmi.core.total_time': 'cmi.total_time', // RO
    'cmi.core.lesson_mode': 'cmi.mode', // RO
    'cmi.core.exit': 'cmi.exit', // WO
    'cmi.core.session_time': 'cmi.session_time', // WO
    'cmi.suspend_data': 'cmi.suspend_data', // RW
    'cmi.launch_data': 'cmi.launch_data', // RO   !!! find out wtf
    'cmi.comments': 'cmi.comments_from_learner.n.comment', // RW n?
    'cmi.comments_from_lms': 'cmi.comments_from_lms.n.comment', // RO n??
    /* 'cmi.objectives._children (id,score,status, RO) Listing of supported data model elements
    'cmi.objectives._count (non-negative integer, RO) Current number of objectives being stored by the LMS
    'cmi.objectives.n.id (CMIIdentifier, RW) Unique label for the objective
    'cmi.objectives.n.score._children (raw,min,max, RO) Listing of supported data model elements
    'cmi.objectives.n.score.raw (CMIDecimal, RW) Number that reflects the performance of the learner, for the objective, relative to the range bounded by the values of min and max
    'cmi.objectives.n.score.max (CMIDecimal, Rw) Maximum value, for the objective, in the range for the raw score
    'cmi.objectives.n.score.min (CMIDecimal, RW) Minimum value, for the objective, in the range for the raw score*/
    // 'cmi.objectives.n.status (“passed”, “completed”, “failed”, “incomplete”, “browsed”, “not attempted”, RW) Indicates whether the learner has completed or satisfied the objective
    // cmi.objectives.n.success_status (“passed”, “failed”, “unknown”, RW) Indicates whether the learner has mastered the objective
    // cmi.objectives.n.completion_status (“completed”, “incomplete”, “not attempted”, “unknown”, RW) Indicates whether the learner has completed the associated objective
    // ? 'cmi.student_data._children (mastery_score, max_time_allowed, time_limit_action, RO) Listing of supported data model elements
    'cmi.student_data.mastery_score': 'cmi.scaled_passing_score', // RO
    'cmi.student_data.max_time_allowed': 'cmi.max_time_allowed ', // RO
    'cmi.student_data.time_limit_action': 'cmi.time_limit_action', // RO
    // (exit,message,” “exit,no message”,” continue,message”, “continue, no message”, RO) Indicates what the SCO should do when max_time_allowed is exceeded
    'cmi.student_preference._children': 'cmi.learner_preference._children', // RO
    // (audio,language,speed,text, RO) (audio_level,language,delivery_speed,audio_captioning, RO)
    'cmi.student_preference.audio': 'cmi.learner_preference.audio_level', // RW
    'cmi.student_preference.language': 'cmi.learner_preference.language', // RW
    'cmi.student_preference.speed': 'cmi.learner_preference.delivery_speed', // RW
    'cmi.student_preference.text': 'cmi.learner_preference.audio_captioning ', // RW
    'cmi.interactions.n.time': 'cmi.interactions.n.timestamp', // RW n??
    'cmi.interactions.n.student_response': 'cmi.interactions.n.learner_response', // WO
  },
};
export const getFromModel = (cmi) => {

};

export const createModel = ({ objectives }) => {
  const model = {};
  // objectives
  if (objectives && Array.isArray(objectives)) {
    model['cmi.objectives._children'] = 'id,score,success_status,completion_status,description';
    model['cmi.objectives._count'] = objectives.length;
    objectives.map((obj, i) => { model[`cmi.objectives.${i}.id`] = obj.id; });
  }
  return model;
};

export const exit = () => (schema === '1.2' ? 'cmi.core.exit' : 'cmi.exit');
export const entry = () => (schema === '1.2' ? 'cmi.core.entry' : 'cmi.entry');

