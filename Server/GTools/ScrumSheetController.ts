function synchronizeScrum() {
  synchronizeCases();
  SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
  //setDataValidations();
  SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
  //pushForgottentMilestonesToScrum();
  cleanEmptyRows();
  var item = new ScrumSheet();
  item.sortProjects();
}
//sprawdza czy sprawy w Scrum są spójne z Db
function checkCasesWithDb() {
  var rowStatus;
  for (var i = SCRUM_FIRST_DATA_ROW; i < SCRUM_DATA_VALUES.length; i++) {
    if (SCRUM_DATA_VALUES[i][SCRUM_COL_CASE_ID]) {
      rowStatus = (SCRUM_DATA_VALUES[i][SCRUM_COL_ROW_STATUS]) ? JSON.parse(SCRUM_DATA_VALUES[i][SCRUM_COL_ROW_STATUS]) : {};
      var caseItem = new Case(undefined);
      caseItem.initFromScrum(i);
      var dbId = caseItem.isSavedInDb();
      if (!dbId) throw new Error("Wiersz " + i + " Brak w bazie sprawy: \n" + JSON.stringify(caseItem));
      Logger.log(dbId)
      //Logger.log(JSON.stringify(caseItem));
    }
  }
}

function cleanEmptyRows() {
  for (var i = SCRUM_DATA_VALUES.length - 1; i >= SCRUM_FIRST_DATA_ROW; i--) {
    var rowStatus = (SCRUM_DATA_VALUES[i][SCRUM_COL_ROW_STATUS]) ? JSON.parse(SCRUM_DATA_VALUES[i][SCRUM_COL_ROW_STATUS]) : {};
    if (!SCRUM_DATA_VALUES[i][SCRUM_COL_TASK_NAME] && !rowStatus.taskToDelete && SCRUM_DATA_VALUES[i][SCRUM_COL_ROW_STATUS]) {
      SCRUM_SHEET.deleteRow(i + 1);
    }
  }
}

function synchronizeCases() {
  var scrumSheet = new ScrumSheet();
  scrumSheet.synchronizeCasesData();
}

function pushForgottentMilestonesToScrum() {
  var items = getCurrentMilestonesList();
  for (var i = 0; i < items.length; i++) {
    if (!findFirstInRange(items[i].id, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID))
      new Milestone(items[i]).addInScrum({ fontWeight: 'bold' });
  }
}

function synchronizePersonsInScrum() {
  var persons = getPersonsList('ENVI_EMPLOYEE|ENVI_MANAGER');
  //persons=persons.filter(function(person){return person.email.indexOf("envi.com.pl")!== -1});
  var personsData = [];
  for (var i = 0; i < persons.length; i++) {
    var row = [];
    row.push(persons[i].id);
    row.push(persons[i].name + ' ' + persons[i].surname);
    personsData.push(row);
  }
  personsData.push(['', 'd']);
  SCRUM_DATA_SHEET.getRange(2, SCRUM_DATA_COL_TASK_OWNER_ID + 1, persons.length + 1, 2).setValues(personsData);
}
/* 
 * @milestonesRangesInScrum
 * { firstRow: firstMilestoneRow,
 *   rowsCount: rowsQuantity,
 *   milestoneId: this.milestoneId
 * }
 */
function setDataValidations(milestonesRangesInScrum) {
  var scrumSheet = new ScrumSheet();
  scrumSheet.setTaskOwnerDataValidationInScrum();
  return;
  //do przerobienia
  if (!milestonesRangesInScrum)
    milestonesRangesInScrum = scrumSheet.makeMilestonesRangesInScrum();
  //przypisz każdemu milestonowi listę spraw
  var casesForMilestonesIds = scrumSheet.setCasesForMilestonesIds();
  //dla każdego zakresu ustaw listę spraw
  for (var i = 0; i < milestonesRangesInScrum.length; i++) {
    var currentMilestoneId = milestonesRangesInScrum[i].milestoneId;
    var cases = casesForMilestonesIds.filter(function (item) { return item.milestoneId == currentMilestoneId })[0].cases;
    var range = SCRUM_SHEET.getRange(milestonesRangesInScrum[i].firstRow, SCRUM_COL_CASE_NAME + 1, milestonesRangesInScrum[i].rowsCount);

    scrumSheet.setCaseNameDataValidationInScrum(range, cases);
  }
}

/* -----------------------------------------------------------------------------------------------------------------------------------------
 * ------------------------------------------------ Tabelka z godzinami pracy --------------------------------------------------------------
 */
function scrumMakeTimesSummary() {
  var desciptions = [
    ['ZAPL.11'],
    ['PON.'],
    ['WT.'],
    ['ŚR.'],
    ['CZW.'],
    ['PT.'],
    ['spotk'],
    ['Razem'],
    ['CZAS PRACY']
  ];
  var sums = [[], [], [], [], [], [], [], [], [], [], []]
  var test = SCRUM_SHEET.getLastRow();
  SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW,
    SCRUM_COL_TIMES_SUMMARY + 1,
    SCRUM_SHEET.getLastRow(),
    SCRUM_COL_TIMES - SCRUM_COL_TIMES_SUMMARY)
    .clear();

  for (var i = 2; i <= 11; i++) {
    var cMode = SCRUM_COL_MODE + 1;
    sums[0].push('=IF(R1C' + cMode + '="Planowanie"; R[1]C-R[2]C;R[2]C-R[9]C)');
    var c = i + 1;
    sums[1].push('=planowanie!I' + c);

    c = SCRUM_COL_TIMES + i - 1;
    sums[2].push('=SUM(R' + SCRUM_FIRST_DATA_ROW + 'C' + c + ':R' + SCRUM_SHEET.getLastRow() + 'C' + c + ')');
    //ustaw czasy dzienne każdej osobie
    for (var j = 3; j <= 7; j++)
      sums[j].push(scrumDailyWorkouts(i - 2, j))

    var r = i + 1,
      r2;
    var meetings = '=SUM(planowanie!E' + r + ':H' + r + ')';
    sums[8].push(meetings);

    var r1 = SCRUM_FIRST_DATA_ROW + 1
    var sum = '=SUM(R' + r1 + 'C:' +
      'R[-1]C)'
    sums[9].push(sum);

    r1 = SCRUM_FIRST_DATA_ROW - 1;
    var diff = '=R' + r1 + 'C-' +
      'R[-1]C'
    sums[10].push(diff);
  }
  SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, SCRUM_COL_TIMES_SUMMARY + 1, 9).setValues(desciptions);
  SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW - 2, SCRUM_COL_TIMES_SUMMARY + 2, 11, 10).setValues(sums);

}

function scrumGetPersons() {
  return SCRUM_DATA_SHEET.getRange(2, 2, SCRUM_DATA_SHEET.getLastRow()).getValues();
}

function scrumDailyWorkouts(personShift, dayShift) {

  var cAllPersons = SCRUM_COL_MON,
    cDay = SCRUM_COL_MON - 2 + dayShift,
    personName = scrumGetPersons()[personShift];
  var formula = '=SUMIF(R' + SCRUM_FIRST_DATA_ROW + 'C' + cAllPersons + ':R' + SCRUM_SHEET.getLastRow() + 'C' + cAllPersons + ';' +
    '"=' + personName + '";' +
    'R' + SCRUM_FIRST_DATA_ROW + 'C' + cDay + ':R' + SCRUM_SHEET.getLastRow() + 'C' + cDay + ')'
  return formula
}