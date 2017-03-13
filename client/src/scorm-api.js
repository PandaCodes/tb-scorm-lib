window.API_1484_11 = {
  Initialize : function() {
    return "true";
  },
  Terminate : function() {
    return "true";
  },
  GetValue : function(key) {
    return '';
    
  },
  SetValue : function(key, val) {
    
  },
  LMSGetLastError : function () {
    
  }
};
window.API = {
  LMSInitialize : function() {
    return API_1484_11.Initialize();
  },
  LMSFinish : function() {
     return API_1484_11.Terminate();
  },
  LMSGetValue : function(key) {
     return API_1484_11.GetValue();
  },
  LMSSetValue : function(key, val) {
     return API_1484_11.SetValue();
  },
  LMSGetLastError : function() {
     return API_1484_11.Initialize();
  },
}