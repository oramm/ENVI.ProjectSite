function Setup() {
}
//-----------------------Baza Danych ------------------------------
var DB_ADDRESS = 'envi.com.pl:3306';
var DB_USER = 'envikons_myEnvi';
var DB_USER_PWD = '7Fj2*j!lA3t@#D';
var DB_NAME = 'envikons_myEnvi';

var DB_STATUS_COL_NAME = 'dbStatus';
var DB_ID_COL_NAME = 'dbId';
//-----------------------------------------------------------------

/* -----------------------------------------------------------------
 * -------------------------- Common -------------------------------
 * ----------------------------------------------------------------- 
 */
var MY_GOOGLE_ACCOUNT_EMAIL = 'marek@envi.com.pl';
var CALENDAR = CalendarApp.getCalendarById('biuro@envi.com.pl');

var SPREADSHEET = SpreadsheetApp.openById('1qrG63qtdKlycxTyH0TqArSwwuCBX_12gR8Hn_MNj4qc');

/* -----------------------------------------------------------------
 * -------------------------- Authorisation -----------------------------
 * ----------------------------------------------------------------- 
 */

Setup.getSystemRole = function (initParamObject) {
    var systemEmail;
    if (!initParamObject)
        initParamObject = { systemEmail: Session.getEffectiveUser().getEmail() };

    var person = new Person(initParamObject);
    var systemRole = person.getSystemRole();
    Logger.log('systemRole: ' + JSON.stringify(systemRole));
    return systemRole;
}
/* -----------------------------------------------------------------
 * -------------------------- Roles --------------------------------
 * ----------------------------------------------------------------- 
 */

/* -----------------------------------------------------------------
 * -------------------------- ScrumBoard --------------------------------
 * ----------------------------------------------------------------- 
 */

var SCRUM_SPREADSHEET = SpreadsheetApp.openById('13j9WZTEJfdjQThxzqd_aQM_1CAnqQPrfQ26v7r4wmBE');
var SCRUM_FIRST_DATA_ROW = 4;
var SCRUM_SHEET_NAME = "aktualny sprint";


var SCRUM_SHEET = SCRUM_SPREADSHEET.getSheetByName(SCRUM_SHEET_NAME);
var SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();

var SCRUM_COL_PROJECT_ID = SCRUM_DATA_VALUES[0].indexOf("Id projektu");
var SCRUM_COL_CONTRACT_DB_ID = SCRUM_DATA_VALUES[0].indexOf("dbId kontraktu");
var SCRUM_COL_CONTRACT_OUR_ID = SCRUM_DATA_VALUES[0].indexOf("ourId kontraktu");
var SCRUM_COL_MILESTONE_ID = SCRUM_DATA_VALUES[0].indexOf("Id kamienia milowego");
var SCRUM_COL_CASE_TYPE_ID = SCRUM_DATA_VALUES[0].indexOf("Id typu sprawy");
var SCRUM_COL_CASE_ID = SCRUM_DATA_VALUES[0].indexOf("Id sprawy");
var SCRUM_COL_TASK_ID = SCRUM_DATA_VALUES[0].indexOf("Id zadania");
var SCRUM_COL_ROW_STATUS = SCRUM_DATA_VALUES[0].indexOf("#ImportStatus");
var SCRUM_COL_CONTRACT_NUMBER = SCRUM_DATA_VALUES[0].indexOf("Nr kontraktu na roboty/dostawy");
var SCRUM_COL_MILESTONE_NAME = SCRUM_DATA_VALUES[0].indexOf("Typ i nazwa kamienia milowego");

var SCRUM_COL_CASE_TYPE = SCRUM_DATA_VALUES[0].indexOf("Typ sprawy I numer sprawy");
var SCRUM_COL_CASE_NAME = SCRUM_DATA_VALUES[0].indexOf("Nazwa sprawy");
var SCRUM_COL_TASK_NAME = SCRUM_DATA_VALUES[0].indexOf("Nazwa zadania");
var SCRUM_COL_TASK_DEADLINE = SCRUM_DATA_VALUES[0].indexOf("Deadline");
var SCRUM_COL_TASK_ESTIMATED_TIME = SCRUM_DATA_VALUES[0].indexOf("szac. czas");
var SCRUM_COL_TASK_STATUS = SCRUM_DATA_VALUES[0].indexOf("Status");
var SCRUM_COL_TASK_OWNER_ID = SCRUM_DATA_VALUES[0].indexOf("Id właściciela");
var SCRUM_COL_TASK_OWNER_NAME = SCRUM_DATA_VALUES[0].indexOf("Kto");

var SCRUM_COL_MON = SCRUM_DATA_VALUES[1].indexOf("PON.");
var SCRUM_COL_TUE = SCRUM_DATA_VALUES[1].indexOf("WTO.");
var SCRUM_COL_WED = SCRUM_DATA_VALUES[1].indexOf("SR.");
var SCRUM_COL_THU = SCRUM_DATA_VALUES[1].indexOf("CZW.");
var SCRUM_COL_FRI = SCRUM_DATA_VALUES[1].indexOf("PT.");

var SCRUM_COL_SPRINT_SUM = SCRUM_DATA_VALUES[1].indexOf("Razem");
var SCRUM_COL_SPRINT_DIFF = SCRUM_DATA_VALUES[1].indexOf("Różnica");
var SCRUM_COL_MODE = SCRUM_DATA_VALUES[0].indexOf('tryb') + 1;

var SCRUM_COL_TIMES_SUMMARY = SCRUM_DATA_VALUES[0].indexOf("#TimesSummary");
var SCRUM_COL_TIMES = SCRUM_DATA_VALUES[0].indexOf("#Times");

var SCRUM_DATA_SHEET_NAME = "dane";
var SCRUM_DATA_SHEET = SCRUM_SPREADSHEET.getSheetByName(SCRUM_DATA_SHEET_NAME);
var SCRUM_DATA_DATA_VALUES = SCRUM_DATA_SHEET.getDataRange().getValues();

var SCRUM_DATA_COL_TASK_OWNER_ID = SCRUM_DATA_DATA_VALUES[0].indexOf("OwnerId");
var SCRUM_DATA_COL_TASK_OWNER_NAME = SCRUM_DATA_DATA_VALUES[0].indexOf("lista osób - zasoby");
var SCRUM_DATA_COL_CASE_ID = SCRUM_DATA_DATA_VALUES[0].indexOf("CaseId");
var SCRUM_DATA_COL_CASE_TYPE_ID = SCRUM_DATA_DATA_VALUES[0].indexOf("CaseTypeId");
var SCRUM_DATA_COL_CASE_MILESTONE_ID = SCRUM_DATA_DATA_VALUES[0].indexOf("Case_MilestoneId");
var SCRUM_DATA_COL_CASE_NAME = SCRUM_DATA_DATA_VALUES[0].indexOf("CaseName");

/* -----------------------------------------------------------------
 * -------------------------- Google Drive --------------------------------
 * ----------------------------------------------------------------- 
 */
namespace MainSetup {
    export var INVOICES_FOLDER_ID = '1WsNoU0m9BoeVHeb_leAFwtRa94k0CD71';
}

var GD_ROOT_FOLDER_ID = '1C_wMgQJtzsFmgsmHp7Dr_F1VJx4v1mjo';
var GD_ROOT_FOLDER = DriveApp.getFolderById(GD_ROOT_FOLDER_ID);

var FOLDERS_SPREADSHEET = SpreadsheetApp.openById('1qrG63qtdKlycxTyH0TqArSwwuCBX_12gR8Hn_MNj4qc');
var FOLDERS_FIRST_DATA_ROW = 3;
var FOLDERS_SHEET_NAME = "Foldery";


var FOLDERS_SHEET = FOLDERS_SPREADSHEET.getSheetByName(FOLDERS_SHEET_NAME);
var FOLDERS_DATA_VALUES = FOLDERS_SHEET.getDataRange().getValues();

var FOLDERS_DATA_COL_IK_ID = FOLDERS_DATA_VALUES[0].indexOf("IK, PT");
var FOLDERS_DATA_COL_IK_RED_FIDIC_ID = FOLDERS_DATA_VALUES[0].indexOf("Roboty Red FIDIC");
var FOLDERS_DATA_COL_IK_YELLOW_FIDIC_ID = FOLDERS_DATA_VALUES[0].indexOf("Roboty YELLOWFIDIC");
var FOLDERS_DATA_COL_SW_ID = FOLDERS_DATA_VALUES[0].indexOf("SW");
var FOLDERS_DATA_COL_SIWZ_ID = FOLDERS_DATA_VALUES[0].indexOf("SIWZ");
var FOLDERS_DATA_COL_INNE_ID = FOLDERS_DATA_VALUES[0].indexOf("INNE");


/* -----------------------------------------------------------------
 * -------------------------- Google Docs --------------------------------
 * ----------------------------------------------------------------- 
 */
var DOCS_PROTOCOL_TEMPLATE_ID = '1B5D2ZUkPgNft0-0JZCtkxSk8eAZa91DnwQY8Bbln9Bo';