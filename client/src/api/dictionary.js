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
    101: 'General Exception',
    201: 'Invalid argument error',
    202: 'Element cannot have children',
    203: 'Element not an array. Cannot have count',
    301: 'Not initialized',
    401: 'Not implemented error',
    402: 'Invalid set value, element is a keyword',
    403: 'Element is read only',
    404: 'Element is write only',
    405: 'Incorrect Data Type',
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
export const getErrorStrings = schemaVersion => errorStrings[schemaVersion];
export const getErrorCodes = schemaVersion => errorCodes[schemaVersion];

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
export const getFunctionNames = schemaVersion => functionNames[schemaVersion];
