// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
//var CLIENT_ID = '336752284630-tljneqr745b11tuq65ktmlhnbedrph4j.apps.googleusercontent.com';
var CLIENT_ID = '386403657277-21tus25hgaoe7jdje73plc2qbgakht05.apps.googleusercontent.com'; //ENVI
//var CLIENT_ID = '369663686128-0q4ccc4crukqi6cg4iinr078k0tf6253.apps.googleusercontent.com'; /// przykłąd
var SCRIPT_ID = 'M1jCQxOsMBQ_tbMmqjqqAx23ed1cy4zrK'; //ENVI
//var SCRIPT_ID = 'M4-wFm_LvxywxkhpIO4s4WZxZ-kvETMHy'; /// przykłąd

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://script.googleapis.com/$discovery/rest?version=v1"];
var SCOPES = ['https://www.google.com/calendar/feeds',
              'https://www.googleapis.com/auth/forms',
              'https://www.googleapis.com/auth/script.external_request',
              'https://www.googleapis.com/auth/script.send_mail',
              'https://www.googleapis.com/auth/spreadsheets',
              'https://www.googleapis.com/auth/userinfo.email'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
//var SCOPES = 'https://www.googleapis.com/auth/drive';  //test

 SCOPES =  'https://www.google.com/calendar/feeds ' + 
              'https://www.googleapis.com/auth/forms ' +
              'https://www.googleapis.com/auth/script.external_request ' +  
              'https://www.googleapis.com/auth/spreadsheets ' +
              'https://www.googleapis.com/auth/userinfo.email ' +
              'https://www.googleapis.com/auth/drive';

var gAuth;
var mainWindowView;