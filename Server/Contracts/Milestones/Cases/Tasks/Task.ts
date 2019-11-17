function Task(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    
    initParamObject.deadline = dateDMYtoYMD(initParamObject.deadline);
    this.deadline = (initParamObject.deadline)? Utilities.formatDate(new Date(initParamObject.deadline), "CET", "yyyy-MM-dd") : undefined;

    this.status = initParamObject.status;
    if (initParamObject._owner){
      this.ownerId = initParamObject._owner.id;
      this._owner = initParamObject._owner;
    }
    if (initParamObject._parent){
      this.caseId = initParamObject._parent.id;
      this._parent = initParamObject._parent;
    }
  }
}

Task.prototype = {
  constructor: Task,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('Tasks', this, conn, isPartOfTransaction);
  },
  /* Służy do dodowania zadań domyślnych dla procesów. Jest odpalana w addNewProcessInstancesForCaseInDb()
   *
   */
  addInDbFromTemplate: function(parent, process, conn, isPartOfTransaction) {
    var taskTemplate = getTaskTemplateByProcessId(process.id, conn);
    if(taskTemplate){
     this.status='Backlog';
     this.name = taskTemplate.name;
     this.description = taskTemplate.description;
     
     return addInDb('Tasks', this, conn, isPartOfTransaction);
    }
  },

  addInScrum: function(externalConn, skipMakeTimesSummary, format){
    if (this.shouldBeInScrum()){
      
      var conn = (externalConn)? externalConn : connectToSql();
      if (!format) format = {fontWeight: null,
                             fontStyle: null,
                             fontLine: 'none'}
      
      var parents = this.getParents(conn);
      //dla kontraktu 'Our' bierz dane z ourData, dla kontraktu na roboty bież dane z kolumny OurIdRelated
      var ourContractOurId = (parents.contractOurId)? parents.contractOurId : parents.contractOurIdRelated;
      var headerContractRow = findFirstInRange(ourContractOurId, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_OUR_ID) + 1;
      if(!headerContractRow) 
        throw new Error("W arkuszu scrumboard nie znaleziono kontraktu " + parents.contractOurId + " dla zadania " + this.name);
      
      var lastContractRow = findLastInRange(ourContractOurId, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_OUR_ID)+1;
      var contractTasksRowsCount = lastContractRow - headerContractRow; 
      Logger.log('Task.addInScrum:: lastContractRow: %s', lastContractRow);
      //wstaw wiersz nowej sprawy
      SCRUM_SHEET.insertRowAfter(lastContractRow);
      
      this.scrumSheetRow = lastContractRow+1
      //wyełnij danymi
      var existingTaskRowData = SCRUM_SHEET.getRange(lastContractRow+3, 1, 1, SCRUM_SHEET.getLastColumn());
      //Logger.log(existingTaskRowData.getValues());
      existingTaskRowData.copyTo(SCRUM_SHEET.getRange(lastContractRow+1, 1),SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      existingTaskRowData.copyTo(SCRUM_SHEET.getRange(lastContractRow+1, 1),SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,false);
      
      var scrumSheet = new ScrumSheet();
      
      var milestoneNameLabel = parents.milestoneTypeFolderNumber + ' ' + parents.milestoneTypeName;
      if(parents.milestoneName)
        milestoneNameLabel += ' | ' + parents.milestoneName;
      
      var parentCase = new Case ({number: parents.caseNumber, _type:{}})
      var parentCaseDisplayNumber = (parentCase.number)? ' | ' + parentCase._displayNumber : '';
      var contract_Number_Alias = parents.contractNumber 
      contract_Number_Alias += (parents.contractAlias)? ' ' + parents.contractAlias : '';
      
      var parentsData = [[parents.projectId, 
                         parents.contractId, 
                         (parents.contractOurId)? parents.contractOurId : parents.contractOurIdRelated, //dla kontrakty our bież dane z ourData, dla kontraktu na roboty bież dane z kolimny OurIdRelated
                         parents.milestoneId,
                         parents.caseTypeId,
                         this.caseId,
                         this.id,
                         (this.ownerId)? this.ownerId : '',
                         '{"caseSynchronized":true,"taskSynchronized":true}',
                         (!parents.contractOurId)? contract_Number_Alias : ' ',
                         milestoneNameLabel,
                         parents.caseTypeFolderNumber + ' ' + parents.caseTypeName + parentCaseDisplayNumber,
                         parents.caseName,
                         this.name,
                         (this.deadline)? this.deadline : '',
                         '',
                         this.status,
                         (this.ownerId)? this._owner.name + ' ' + this._owner.surname : ''
                         ]];
      SCRUM_SHEET.getRange(lastContractRow+1, SCRUM_COL_PROJECT_ID+1,1, SCRUM_COL_TASK_OWNER_NAME+1)
        .setValues(parentsData)
        .setFontWeight(format.fontWeight);
      
      var timesRange = SCRUM_SHEET.getRange(lastContractRow+2, SCRUM_COL_TIMES+1,1, SCRUM_SHEET.getLastColumn()-SCRUM_COL_TIMES+1);
      var timesRangeFormulas = timesRange.getFormulas(); 
      scrumSheet.setSprintSumsInRows(lastContractRow+1);
      //odtwórz #Times (ostatnie kolumny arkusza)
      scrumSheet.setSumInContractRow(headerContractRow, contractTasksRowsCount+1);
      timesRange.setFormulas(timesRangeFormulas);  
      //odtwórz #TimesSummary
      if (lastContractRow<13 && !skipMakeTimesSummary) scrumMakeTimesSummary();
      
      scrumSheet.sortContract(ourContractOurId);
      SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
      return {lastContractRow: lastContractRow
             };
    }
    else
      Logger.log('Nie dodaję do Scruma');
  },
  
  getParents: function(conn, isPartOfTransaction){
    var stmt = conn.createStatement();
    var query = 'SELECT \n \t' +
                  'Cases.Name AS CaseName, \n \t' +
                  'Cases.TypeId AS CaseTypeId, \n \t' +
                  'Cases.Number AS CaseNumber, \n \t' +
                  'CaseTypes.Name AS CaseTypeName, \n \t' +      
                  'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
                  'Milestones.Id AS MilestoneId, \n \t' +
                  'Milestones.Name AS MilestoneName, \n \t' +  
                  'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
                  'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
                  'ParentContracts.Id AS ParentContractId, \n \t' +
                  //OurContractsData może dotyczyć _parenta lub kontraktu powiązanego z kontraktem parentem - kolumna 'OurIdRelated'
                  'OurContractsData.OurId AS OurContractsDataOurId, \n \t' +
                  'ParentContracts.OurIdRelated AS ParentContractOurIdRelated, \n \t' +
                  'ParentContracts.Number AS ParentContractNumber, \n \t' +
                  'ParentContracts.Alias AS ParentContractAlias, \n \t' +
                  'ParentContracts.ProjectOurId \n' +
                'FROM Cases \n' +
                'LEFT JOIN CaseTypes ON CaseTypes.Id=Cases.TypeId \n' +
                'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
                'LEFT JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
                'JOIN Contracts AS ParentContracts ON Milestones.ContractId = ParentContracts.Id \n' +
                'LEFT JOIN OurContractsData ON Milestones.ContractId = OurContractsData.Id \n' +
                'JOIN ContractTypes ON ContractTypes.Id = ParentContracts.TypeId \n' +
                'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.ContractTypeId=ContractTypes.Id AND MilestoneTypes_ContractTypes.MilestoneTypeId=MilestoneTypes.Id \n' +
                'WHERE Cases.Id =' + this.caseId + '';
    Logger.log(query)
    var dbResults = stmt.executeQuery(query);
    dbResults.last();
    return {caseName: dbResults.getString('CaseName'),
            caseTypeId: dbResults.getString('CaseTypeId'),
            caseNumber: dbResults.getInt('CaseNumber'),
            caseTypeName: dbResults.getString('CaseTypeName'),
            caseTypeFolderNumber: dbResults.getString('CaseTypeFolderNumber'),
            milestoneId: dbResults.getLong('MilestoneId'),
            milestoneName: dbResults.getString('MilestoneName'),
            milestoneTypeName: dbResults.getString('MilestoneTypeName'),
            milestoneTypeFolderNumber: dbResults.getString('MilestoneTypeFolderNumber'),
            contractId: dbResults.getLong('ParentContractId'),
            contractOurId: dbResults.getString('OurContractsDataOurId'), //dla ourContracts
            contractOurIdRelated: dbResults.getString('ParentContractOurIdRelated'), //dla kontraktów na roboty
            contractNumber: dbResults.getString('ParentContractNumber'),
            contractAlias: dbResults.getString('ParentContractAlias'),
            projectId: dbResults.getString('ProjectOurId')
           }
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('Tasks', this, externalConn, isPartOfTransaction);
  },
  
  editInScrum: function(){
    var lock = LockService.getScriptLock();
    
    var row = findFirstInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_TASK_ID) + 1;
    if (row){
      if (this.shouldBeInScrum()){
        var taskData = [[
          this.name,
          (this.deadline)? this.deadline : '',
          '',
          this.status,
          (this._owner && this._owner.id)? this._owner.name + ' ' + this._owner.surname : ''
        ]]
        SCRUM_SHEET.getRange(row, SCRUM_COL_TASK_NAME+1,1,5).setValues(taskData);
      } 
      else
        this.deleteFromScrum();
    } 
    else{ //zmieniono status z 'Backlog' albo przypisano do pracownika ENVI
      lock.tryLock(40000);
      this.addInScrum();
      lock.releaseLock();
    }
  },
  
  deleteFromDb: function (){
    deleteFromDb ('Tasks', this, undefined, undefined);
  },
  
  deleteFromScrum: function(){  
    var row = findFirstInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_TASK_ID) + 1;
    if (row){
      SCRUM_SHEET.deleteRow(row);
      if(row<13){
        //odtwórz #TimesSummary i #Times
        scrumMakeTimesSummary();
      }
    }
  },
  /*
   * sprawdza czy zadanie powinno znaleźć się w arkuszu SCRUM
   */
  shouldBeInScrum: function(){
    var test;
    if(this._owner && this._owner.id)
      test = this.status!=='Backlog' &&  Setup.getSystemRole({id:this._owner.id}).systemRoleId<=3
    else
      test = this.status!=='Backlog';
    Logger.log('Task: ' + this.name + ' shouldBeInScrum: ' + test + '\n');
    return test;
  }, 
  initFromScrum: function(rowInScrumDataValues){
    // deadline
    var friday:any = ToolsDate.getNextFridayDate()
    friday = Utilities.formatDate(friday, "CET", "yyyy-MM-dd");
    
    var deadline = SCRUM_DATA_VALUES[rowInScrumDataValues][SCRUM_COL_TASK_DEADLINE];
    
    if (typeof deadline == 'string' && deadline.indexOf('kt') >= 0) {
      deadline = friday
    }
    else if (deadline) {
      //Logger.log('row ' +rowInScrumDataValues + ' deadline: ' + deadline);
      deadline = Utilities.formatDate(deadline, "CET", "yyyy-MM-dd");
    }
    else
      deadline = null;
    
    //owner
    var chosenOwnerName = SCRUM_DATA_VALUES[rowInScrumDataValues][SCRUM_COL_TASK_OWNER_NAME];
    if (chosenOwnerName) var ownerRowInDataSheet = findFirstInRange(chosenOwnerName, SCRUM_DATA_DATA_VALUES, SCRUM_DATA_COL_TASK_OWNER_NAME);
    if (ownerRowInDataSheet) var chosenOwnerId = SCRUM_DATA_DATA_VALUES[ownerRowInDataSheet][SCRUM_DATA_COL_TASK_OWNER_ID];
         
    this.id = SCRUM_DATA_VALUES[rowInScrumDataValues][SCRUM_COL_TASK_ID];
    this.caseId = SCRUM_DATA_VALUES[rowInScrumDataValues][SCRUM_COL_CASE_ID];
    this.name = SCRUM_DATA_VALUES[rowInScrumDataValues][SCRUM_COL_TASK_NAME];
    this.deadline = deadline;
    this.status = SCRUM_DATA_VALUES[rowInScrumDataValues][SCRUM_COL_TASK_STATUS];
    this.ownerId = chosenOwnerId;
    this.ownerName = chosenOwnerName;
    this.rowStatus = (SCRUM_DATA_VALUES[rowInScrumDataValues][SCRUM_COL_ROW_STATUS])? JSON.parse(SCRUM_DATA_VALUES[rowInScrumDataValues][SCRUM_COL_ROW_STATUS]) : {};
    this.sheetRow = rowInScrumDataValues + 1;
    
  }
}