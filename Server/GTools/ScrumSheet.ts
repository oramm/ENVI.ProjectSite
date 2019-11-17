function ScrumSheet() {
  this.casesInDb;
}

ScrumSheet.prototype = {
  constructor: ScrumSheet,
  
  //ustawia podsumwanie dla wiersza kontraktu (nagłówka)
  setSumInContractRow: function(rowNumber, rowsCount){
    SCRUM_SHEET.getRange(rowNumber, SCRUM_COL_SPRINT_SUM+1,1,2).setValue('=SUM(R[1]C:R[' + rowsCount + ']C)');
    SCRUM_SHEET.getRange(rowNumber, SCRUM_COL_TASK_ESTIMATED_TIME+1).setValue('=SUM(R[1]C:R[' + rowsCount + ']C)');
  },
  //ustawia sumy dla wierszy poszczególnych zadań
  setSprintSumsInRows: function(rowNumber, rowsCount){
    if(!rowsCount) rowsCount = 1;
    SCRUM_SHEET.getRange(rowNumber, SCRUM_COL_SPRINT_SUM+1,rowsCount).setValue('=SUM(RC[-5]:RC[-1])'); //suma dla zadania
    SCRUM_SHEET.getRange(rowNumber, SCRUM_COL_SPRINT_SUM+2,rowsCount).setValue('=RC[-9]-RC[-1]');
  },
  //zwraca zakres #Times - z formułami na czasy dla poszczególnych osób i zadań
  getTimesRange : function(firstRowNumber, rowsCount){
    if (!firstRowNumber && !rowsCount){ 
      firstRowNumber = SCRUM_FIRST_DATA_ROW;
      rowsCount = SCRUM_SHEET.getLastRow();
    }
    else if (!rowsCount) rowsCount = 1;
    
    return SCRUM_SHEET.getRange(firstRowNumber, SCRUM_COL_TIMES+1,rowsCount, SCRUM_SHEET.getLastColumn()-SCRUM_COL_TIMES+1);
  },
  
  sortProjects: function(){
    SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
    //SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, 1, SCRUM_SHEET.getLastRow(), SCRUM_SHEET.getLastColumn())
    var lastRow = findFirstInRange('ENVI', SCRUM_DATA_VALUES, SCRUM_COL_PROJECT_ID);
    Logger.log(lastRow);
    SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, 1, lastRow-3, SCRUM_SHEET.getLastColumn())
    .sort([{column: SCRUM_COL_PROJECT_ID+1, ascending: true},
           {column: SCRUM_COL_CONTRACT_OUR_ID+1, ascending: true},
           {column: SCRUM_COL_CONTRACT_DB_ID+1, ascending: true},
           {column: SCRUM_COL_MILESTONE_ID+1, ascending: true},
           {column: SCRUM_COL_CASE_TYPE+1, ascending: true},
           {column: SCRUM_COL_TASK_OWNER_NAME+1, ascending: true}
          ]);
    SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
  },
  
  sortContract: function(ourId){
    SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
    var firstContractRow = findFirstInRange(ourId, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_OUR_ID)+1;
    if(!firstContractRow) 
      throw new Error("sortContract:: w arkuszu scrumboard nie znaleziono kontraktu " + ourId);
    var lastContractRow = findLastInRange(ourId, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_OUR_ID)+1;
    var contractRowsCount = lastContractRow - firstContractRow; 
    SCRUM_SHEET.getRange(firstContractRow+1, 1, contractRowsCount, SCRUM_SHEET.getLastColumn())
    .sort([{column: SCRUM_COL_CONTRACT_DB_ID+1, ascending: true},
           {column: SCRUM_COL_MILESTONE_ID+1, ascending: true},
           {column: SCRUM_COL_CASE_TYPE+1, ascending: true},
           {column: SCRUM_COL_TASK_OWNER_NAME+1, ascending: true}
          ]);
    SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
  },
  
  getOwnerNameById: function (id){ 
    if (id) {
      var chosenOwnerDataSheeRow = findFirstInRange(id, SCRUM_DATA_DATA_VALUES, SCRUM_DATA_COL_TASK_OWNER_ID);
      if(chosenOwnerDataSheeRow) return SCRUM_DATA_DATA_VALUES[chosenOwnerDataSheeRow][SCRUM_DATA_COL_TASK_OWNER_NAME];
    }
    return '';
  },
  
  getOwnerIdByName: function (name){ 
    var chosenOwnerDataSheeRow = findFirstInRange(name, SCRUM_DATA_DATA_VALUES, SCRUM_DATA_COL_TASK_OWNER_NAME);
    return SCRUM_DATA_DATA_VALUES[chosenOwnerDataSheeRow][SCRUM_DATA_COL_TASK_OWNER_ID];
  },
  //ustawia Id w kolumnie SCRUM_COL_TASK_OWNER_ID
  setOwnerId: function(sheetRow, name){
    var id = this.getOwnerIdByName(name);
    SCRUM_SHEET.getRange(sheetRow, SCRUM_COL_TASK_OWNER_ID+1).setValue(id);
  },
  
  getCaseIdFromDb: function (caseItem){
    //pobierz do gsheet Id krotki z bazy - potrzebne przy edycji
    var conn = connectToSql();
    var stmt = conn.createStatement();
    var sql = ('SELECT id FROM Cases WHERE Name="'+ caseItem.Name + '"');
    var results = stmt.executeQuery(sql);
    results.last();
    
    conn.commit();
    conn.close();
    
    return results.getLong(1);
  },
  
  setTaskOwnerDataValidationInScrum: function(){
    //var criteria = SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST;
    var personsRange = SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, SCRUM_COL_TASK_OWNER_NAME+1,SCRUM_SHEET.getLastRow()-SCRUM_FIRST_DATA_ROW);
    var personsDataRange =  SCRUM_DATA_SHEET.getRange(2,SCRUM_DATA_COL_TASK_OWNER_NAME+1, SCRUM_DATA_SHEET.getLastRow())
    var rule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(personsDataRange)
        .setAllowInvalid(false)
        .setHelpText('Wybierz odpowiednią osobę')
        .build();
  
    personsRange
      .clearDataValidations()
      .setDataValidation(rule);
    //https://developers.google.com/apps-script/reference/spreadsheet/range#setDataValidation(DataValidation)
    
  },

  setCaseNameDataValidationInScrum: function(range, cases){   
    range
      .clearDataValidations();
    //Logger.log(JSON.stringify(cases));
    if(cases.length>0){
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(cases)
        .setAllowInvalid(true)
        .setHelpText('Wybierz sprawę lub zmień jej nazwę')
        .build();
        
      range
        .setDataValidation(rule);
        //https://developers.google.com/apps-script/reference/spreadsheet/range#setDataValidation(DataValidation)
    }
  },
  //TODO: przerobić na setCasesForCaseTypesIds 
  //połącz nazwy spraw z milestonami
  setCasesForMilestonesIds: function (){
    //Cases
    var cases = getCasesList();
    for(var i =0; i<cases.length; i++)
      cases[i] = { milestoneId: cases[i].milestoneId,
                  caseName: cases[i].name
                 }
    var milestonesIds = onlyUnique(getColumnArray(SCRUM_DATA_VALUES,SCRUM_COL_MILESTONE_ID));
    milestonesIds = milestonesIds.filter(function(item){return item>0});
    var milestonesCases = [];
    
    for(var i = 0; i <milestonesIds.length; i++){
      var currentMilestoneCases = cases.filter(function(item){ return item.milestoneId == milestonesIds[i]});
      //wyrzuć zbędne dane z listy spraw
      for(var j = 0; j <currentMilestoneCases.length; j++)
        currentMilestoneCases[j] = currentMilestoneCases[j].caseName; 
      var currentMilestoneData = {milestoneId: milestonesIds[i], cases: currentMilestoneCases}
      
      milestonesCases.push(currentMilestoneData);
    }
    return milestonesCases;
  },
    
    //stwórz zakresy dla poszczególnych milestonów
    makeMilestonesRangesInScrum: function (){
      var milestonesRangesData = [];
      var previousMilestoneId;
      //ustaw dane z pierwszego wiersza
      var currentRangeData = { firstRow: SCRUM_FIRST_DATA_ROW+1,
                               rowsCount: 1,
                               milestoneId: SCRUM_DATA_VALUES[SCRUM_FIRST_DATA_ROW][SCRUM_COL_MILESTONE_ID]
                             };
      for(var i = SCRUM_FIRST_DATA_ROW+1; i <SCRUM_DATA_VALUES.length; i++){
        var t = SCRUM_DATA_VALUES[i][SCRUM_COL_MILESTONE_ID];
        //mamy ten sam milestone
        if (SCRUM_DATA_VALUES[i][SCRUM_COL_MILESTONE_ID]==currentRangeData.milestoneId) {
          currentRangeData.rowsCount++;
          if (i==SCRUM_DATA_VALUES.length){
            milestonesRangesData.push({ firstRow: currentRangeData.firstRow,
                                        rowsCount: currentRangeData.rowsCount,
                                        milestoneId: currentRangeData.milestoneId
                                      });
          }
        }
        //mamy zmianę milestone
        else if(SCRUM_DATA_VALUES[i][SCRUM_COL_MILESTONE_ID]){
          milestonesRangesData.push({ firstRow: currentRangeData.firstRow,
                                      rowsCount: currentRangeData.rowsCount,
                                      milestoneId: currentRangeData.milestoneId
                                    });
          currentRangeData.firstRow = i+1;
          currentRangeData.rowsCount = 1;
          currentRangeData.milestoneId = SCRUM_DATA_VALUES[i][SCRUM_COL_MILESTONE_ID];
        }
      }
      //Logger.log(JSON.stringify(milestonesRangesData))
      return milestonesRangesData;
  },
  //zapisz dane cases bazy do scrum - ułatwia obsługę edycji arkusza
  synchronizeCasesData: function(){
    this.casesInDb = getCasesList();
    var casesData = [];
    for (var i=0; i<this.casesInDb.length; i++){
      var row=[];
      row.push(this.casesInDb[i].id);
      row.push((this.casesInDb[i].typeId)? this.casesInDb[i].typeId : '');
      row.push(this.casesInDb[i].milestoneId);
      row.push(this.casesInDb[i].name);
      row.push((this.casesInDb[i].gdFolderId)? this.casesInDb[i].gdFolderId : '');
      casesData.push(row);
    }
    SCRUM_DATA_SHEET.getRange(2, SCRUM_DATA_COL_CASE_ID+1, SCRUM_DATA_SHEET.getLastRow()-1, 5).clear();
    SCRUM_DATA_SHEET.getRange(20, SCRUM_DATA_COL_CASE_ID+1, this.casesInDb.length, 5).setValues(casesData);
    
    SCRUM_DATA_DATA_VALUES = SCRUM_DATA_SHEET.getDataRange().getValues();
  }
}


function test_sortProject(){
  var item = new ScrumSheet();
  item.sortProjects();
}