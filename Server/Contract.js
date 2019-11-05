function Contract(initParamObject, conn) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.alias = initParamObject.alias;
    this.typeId = initParamObject._type.id;
    this._type = initParamObject._type;
    //id tworzone tymczasowo po stronie klienta do obsługi tymczasowego wiersza resultsecie
    this._tmpId = initParamObject._tmpId;
    this.number = initParamObject.number;
    this.name = initParamObject.name;
    //kontrakt na roboty może być obsługiwany przez ourContract
    if (initParamObject._ourContract && initParamObject._ourContract.ourId){
      if (initParamObject.ourId) throw new Error("Nie można powiązać ze sobą dwóch Umów ENVI!!!");
      if(initParamObject._ourContract.ourId.indexOf(' ')>0) 
        //TODO: linijka do usunięcia chyba
        initParamObject.ourIdRelated = initParamObject.ourIdRelated.substring(0,initParamObject.ourIdRelated.indexOf(' '));
      
      this._ourContract = initParamObject._ourContract;
      this._ourContract.ourId = initParamObject._ourContract.ourId.toUpperCase();
      this._ourContract._ourType = this.getType(initParamObject._ourContract.ourId);
      this._ourContract._gdFolderUrl = Gd.createGdFolderUrl(initParamObject._ourContract.gdFolderId);
      if(initParamObject._ourContract.name)
        this._ourContract._ourIdName = initParamObject._ourContract.ourId + ' ' + initParamObject._ourContract.name.substr(0,50) + '...';
      this.ourIdRelated = initParamObject._ourContract.ourId;
    }
    if(initParamObject._ourContract) this.ourIdRelated = initParamObject._ourContract.ourId;
    this.projectId = initParamObject.projectId;
    
    initParamObject.startDate = dateDMYtoYMD(initParamObject.startDate);
    this.startDate = (initParamObject.startDate)? Utilities.formatDate(new Date(initParamObject.startDate), "CET", "yyyy-MM-dd") : undefined;
    initParamObject.endDate = dateDMYtoYMD(initParamObject.endDate);
    this.endDate = (initParamObject.endDate)? Utilities.formatDate(new Date(initParamObject.endDate), "CET", "yyyy-MM-dd") : undefined;
    
    this.value = initParamObject.value;
    this.comment = initParamObject.comment;
    
    if (initParamObject.ourId) {
      this.ourId = initParamObject.ourId.toUpperCase();
      this._ourType = this.getType(this.ourId);
    }
    if (initParamObject.gdFolderId) {
      this.gdFolderId = initParamObject.gdFolderId;
      this._gdFolderUrl = 'https://drive.google.com/drive/folders/' + initParamObject.gdFolderId;
    }
    this.meetingProtocolsGdFolderId = initParamObject.meetingProtocolsGdFolderId;
    if (initParamObject.ourId && this.name)
      this._ourIdName = initParamObject.ourId + ' ' + initParamObject.name.substr(0,50) + '...';
    else if (this.name)
      this._numberName = initParamObject.number + ' ' + initParamObject.name.substr(0,50) + '...';
    
    //znacznik uniwersalny gdy chemy wybierać ze wszystkich kontraktów Our i Works
    var _ourIdOrNumber = '';
    if (this.ourId) _ourIdOrNumber = this.ourId;
    if (this.number) _ourIdOrNumber = this.number;
      
    if (this.name){
      this._ourIdOrNumber_Name = _ourIdOrNumber + ' ' + this.name.substr(0,50) + '...'
    }
    this._ourIdOrNumber_Alias = _ourIdOrNumber;
    if(this.alias) 
      this._ourIdOrNumber_Alias += ' ' + this.alias;
    
    this._manager = (initParamObject._manager)? initParamObject._manager : {}; 
    this._admin = (initParamObject._admin)? initParamObject._admin : {};
    
    this._contractors = (initParamObject._contractors)? initParamObject._contractors : [];
    
    this._engineers = (initParamObject._engineers)? initParamObject._engineers : [];
    this._employers = (initParamObject._employers)? initParamObject._employers : [];
    
    this.contractUrl = initParamObject.contractUrl;
    this.gdUrl = initParamObject.gdUrl;
    
    this.status = initParamObject.status;
    
    this.scrumSheet = new ScrumSheet();
  }
}

Contract.prototype = {
  constructor: Contract,
  isOur: function(){
    return this._type.isOur;
  },
  
  setEntitiesFromParent: function(conn){
    if (this._parent)
      this._engineers = this._parent._engineers;
    else { 
      var entitiesPerProject = getProjectEntityAssociationsPerProjectList(this.projectId, conn);
      var engineersPerProject = entitiesPerProject.filter(function(item){
        return item.projectRole=='ENGINEER';
      });
      var employersPerProject = entitiesPerProject.filter(function(item){
        return item.projectRole=='EMPLOYER';
      });
      if(engineersPerProject[0]) 
        this._engineers = engineersPerProject.map(function(item){return item._entity});
      if(employersPerProject[0]) 
        this._employers = employersPerProject.map(function(item){return item._entity});
    }
  },
  
  createMeetingProtocolsGdFolder: function(){
    var root = DriveApp.getFolderById(this.gdFolderId);
    return Gd.setFolder(root, 'Notatki ze spotkań');
  },
  
  addInDb: function(externalConn, isPartOfTransaction) {
    var conn = (externalConn)? externalConn : connectToSql(); 
    conn.setAutoCommit(false);
  
    var start = new Date();
    try {
      
      var stmt = conn.createStatement();
      var sql = 'INSERT INTO Contracts (TypeId, Number, Name, Alias, ourIdRelated, ProjectOurId, StartDate, EndDate, Value, Comment, Status, GdFolderId, MeetingProtocolsGdFolderId) \n' +
                  'VALUES (' + 
                           prepareValueToSql(this.typeId) + ', \n \t' +
                           prepareValueToSql(this.number) + ', \n \t' + 
                           prepareValueToSql(this.name) + ', \n \t' +
                           prepareValueToSql(this.alias) + ', \n \t' +
                           prepareValueToSql(this.ourIdRelated) + ', \n \t' +
                           prepareValueToSql(this.projectId) + ', \n \t' +
                           prepareValueToSql(this.startDate) + ', \n \t' +
                           prepareValueToSql(this.endDate) + ', \n \t' +
                           prepareValueToSql(this.value) + ', \n \t' +
                           prepareValueToSql(this.comment) + ', \n \t' +
                           prepareValueToSql(this.status) + ', \n \t' +
                           prepareValueToSql(this.gdFolderId) + ', \n \t' +
                           prepareValueToSql(this.meetingProtocolsGdFolderId) + ' \n' +
                         ')';
      
      //Logger.log(sql);
      stmt.executeUpdate(sql);
          
      var stmt3 = conn.createStatement();
      var sql = ('SELECT LAST_INSERT_ID()');
      var results = stmt3.executeQuery(sql);
      
      results.last();
      this.id = results.getLong(1);
      if (this.ourId) {
        this.addOurContractInDb(stmt);
      } else
        this.addEntitiesAssociationsInDb(conn);
      
      if (!isPartOfTransaction) conn.commit();
      var end = new Date();

      Logger.log('Time elapsed: %sms', end - start);
      return this.id;
    } catch (e) {
      Logger.log('Błąd Contract.addInDb:: ' + this.number);
      throw e;
    } finally {
      if (!externalConn) {
        Logger.log('Closing connection' + ' ExternalConnection: ')
      }
    }    
  },
  
  addEntitiesAssociationsInDb: function(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    this._contractors = this._contractors.map(function(item){item.contractRole = 'CONTRACTOR'; 
                                                             return item 
                                                            });
    this._engineers = this._engineers.map(function(item){item.contractRole = 'ENGINEER'; 
                                                             return item 
                                                            });
    this._employers = this._employers.map(function(item){item.contractRole = 'EMPLOYER'; 
                                                             return item 
                                                            });
    var entities = this._employers.concat(this._contractors, this._engineers); 
    try {
      for(var i=0; i<entities.length; i++){
        var entityAssociation = new ContractEntity({contractRole: entities[i].contractRole,
                                                    _contract: this,
                                                    _entity: entities[i]
                                                   });
        entityAssociation.addInDb(externalConn);
      }
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  },
  
  addOurContractInDb: function(stmt){
    try {
      var sql = 'INSERT INTO OurContractsData (Id, OurId, ManagerId, AdminId, ContractURL) \n' +
                  'VALUES (' + 
                           this.id + ', \n \t' + 
                           prepareValueToSql(this.ourId) + ', \n \t' + 
                           '(SELECT Id FROM Persons WHERE Id=' + prepareValueToSql(this._manager.id) + '), \n \t' + 
                           '(SELECT Id FROM Persons WHERE Id=' + prepareValueToSql(this._admin.id) + '), \n \t' + 
                           prepareValueToSql(this.contractUrl) + ' \n' + 
                          ')';
      
      //Logger.log(sql);
      stmt.executeUpdate(sql);
    } catch (e) {
      Logger.log('addOurContractInDb error');
      Logger.log(sql);
      throw e;
    }
  },
  /*  
   *
   */
  createDefaultTasksInDb: function(foldersGdData, externalConn, isPartOfTransaction){
    var conn = (externalConn)? externalConn : connectToSql();
    try{
      var defaultMilestoneTemplates = getMilestoneTemplatesPerContractTypeId({contractTypeId: this._type.id,
                                                                             isDefaultOnly: true
                                                                            }, conn);
      if (defaultMilestoneTemplates.length==0 && this.isOur) throw new Error('Typ kontraktu, który próbujesz dodać nie ma przypisanego żadnego szablonu kamienia milowego!\n' +
                                                               'Zgłoś administratorowi potrzebę utworzenia szablonów kamieni, spraw i zadań'
                                                              );
      var defaultCaseTemplates = getCaseTemplatesListPerContractType({contractTypeId: this._type.id,
                                                                      isDefaultOnly: true
                                                                     },conn);
      if (defaultCaseTemplates.length==0 && this.isOur) throw new Error('Typ kontraktu, który próbujesz dodać nie ma przypisanego żadnego szablonu sprawy!\n' +
                                                               'Zgłoś administratorowi potrzebę utworzenia szablonów spraw i zadań'
                                                              );
      
      Logger.log('Pobrano szablony z db');
                 
      var defaultMilestones = [], allDefaultMilestonesdefaultCaseItems = [], allDefaultCasesDefaultTasks = [];
      for (var i=0; i<defaultMilestoneTemplates.length; i++){
        var currentMilestone = this.createDefaultMilestone(defaultMilestoneTemplates[i],foldersGdData, conn);
        defaultMilestones.push(currentMilestone);
        var defaultItems = currentMilestone.createDefaultCasesInDb({foldersGdData: foldersGdData,
                                                                    defaultCaseTemplates: defaultCaseTemplates,
                                                                    externalConn: conn, 
                                                                    isPartOfTransaction:true
                                                                   })
        allDefaultMilestonesdefaultCaseItems = allDefaultMilestonesdefaultCaseItems.concat(defaultItems.caseItems);
        allDefaultCasesDefaultTasks = allDefaultCasesDefaultTasks.concat(defaultItems.tasks);
      }
      if (!isPartOfTransaction) conn.commit();
      //do wykorzystania w this.createDefaultTasksInScrum()
      return {milestones: defaultMilestones,
              caseItems: allDefaultMilestonesdefaultCaseItems,
              tasks: allDefaultCasesDefaultTasks
             };
      
      //TODO: użyć tego w interpreterze reguł z kolumny DeadLineRule w Db
      var initOurContractDeadline = new Date(Math.max(ToolsDate.getNextFridayDate(), 
                                                      ToolsDate.addDays(this.startDate,7))
                                            );
      initOurContractDeadline = Utilities.formatDate(initOurContractDeadline, "CET", "yyyy-MM-dd");
      
    } catch (e) {
      Logger.log('createDefaultTasksInDb error');
      throw e;
    } finally {
      //if (!externalConn) conn.close();
    }      
  },
  
  /*
   * ustawia Id folderów na podstawie danych z generatora folderów. Wywyływana prz tworzeniu kontraktu.
   * używać tylko dla kamieni i spraw unikalnych
   * tworzenie zadań musi być podzielone na etap Db i potem scrum i przypisanie ID do folderów bo trzeba skrócić czas trwania połaczenia z bazą
   * param(defaultItems) pochodzi z this.createDefaultTasksInDb() i są to {milestones[], caseItems[], tasks[]}
   */
  setDefaultsubItemFolderIdFromFoldersData: function(defaultItemDb, foldersGdData){
    var j=0;
    //ustaw j na własciwy folder
    while(j<foldersGdData.length &&
          defaultItemDb._folderName.trim() != foldersGdData[j].name.trim()){
      j++;
    }
    if(j==foldersGdData.length && defaultItemDb._folderName.trim() != foldersGdData[j-1].name.trim())
    throw new Error("setContractFoldersIdsFromFoldersData:: nie znaleziono folderu o nazwie: " + defaultItemDb._folderName + '\n' + JSON.stringify(defaultItemDb));
    
    var logLabel = (defaultItemDb.startDate)? 'Folder Kamienia' : 'Folder Sprawy';
    Logger.log(logLabel + ': ' + foldersGdData[j].name);
    
    defaultItemDb.gdFolderId = foldersGdData[j].gdFolderId;
    foldersGdData = foldersGdData.filter(function(item){return item.name != foldersGdData[j].name});
  },

  //tworzy domyślny kamień milowy i zapisuje go w db
  createDefaultMilestone: function(template, foldersGdData, conn){
    // TODO: wymusić obowiązek podawania dat początki i końca dla kontraktu      
    var milestone = new Milestone({name: template.name,// jeśli kamień jest uniqe, nazwa jest niepotrzebna,
                                   _type: template._milestoneType,
                                   startDate: this.startDate,
                                   endDate: this.endDate,
                                   status: (template.status)? template.status : 'Nie rozpoczęty',
                                   _parent: this
                                  })
    Logger.log('\n\n------------------- Dodaję kamień: ' + milestone._type.name + ' ' + milestone.name + '------------------\n' +
               'isUniquePerContract ' + milestone._type.isUniquePerContract + '\n')
      
    this.setDefaultsubItemFolderIdFromFoldersData(milestone, foldersGdData);
    milestone.addInDb(conn, true);
    return milestone;
  },
  
  addInScrum: function(defaultItems){
    if(this.isOur()){
      var rowsQuantity = 1;
      //wstaw wiersze nowej umowy
      SCRUM_SHEET.insertRowAfter(SCRUM_FIRST_DATA_ROW-1);
      //wypełnij danymi
      var rangeToCopy = SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW + 1, 1, rowsQuantity, SCRUM_SHEET.getLastColumn());
      rangeToCopy.copyTo(SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, 1),{formatOnly: true});
      rangeToCopy.copyTo(SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, 1),SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,false);
      SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, SCRUM_COL_PROJECT_ID+1, 1,SCRUM_COL_TASK_OWNER_NAME+1)
      .setValues([[this.projectId,
                   0,
                   this.ourId,0,0,0,0,
                   this._manager.id,'',
                   '=HYPERLINK("'+ this._gdFolderUrl + '";"'+ this.ourId + ' ' + this.scrumSheet.getOwnerNameById(this._manager.id) + '")',
                   '','','','d','d','d','d','d'
                  ]]);
      SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
    }
    this.createDefaultTasksInScrum(defaultItems);
  },
  
  /*
   * tworzenie zadań musi być podzielone na etap Db i scrum bo trzeba skrócić czas trwania połaczenia z bazą
   * param(defaultItems) pochodzi z this.createDefaultTasksInDb();
   */
  createDefaultTasksInScrum: function(defaultItems){
    var conn = connectToSql();
    try{
      //dodaj zadania do scruma
      for (var i=0; i<defaultItems.tasks.length; i++)
        defaultItems.tasks[i].addInScrum(conn,'SKIP_MAKE_TIMES_SUMMARY');
      
      //po dodaniu zadań do scruma trzeba dodać sprawy do scrumboarda dla porządku
      for (var i=0; i<defaultItems.caseItems.length; i++){
        defaultItems.caseItems[i].addInScrum();
        //ustaw walidację dla sprawy
        //var caseRange = SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW+i+1,SCRUM_COL_CASE_NAME+1);
        //Logger.log('setCaseNameDataValidationInScrum::' + (SCRUM_FIRST_DATA_ROW+i+1)/1 + ' currentCase.name ' + defaultItems.caseItems[i].name);
        //this.scrumSheet.setCaseNameDataValidationInScrum(caseRange, [defaultItems.caseItems[i].name]);
      }
      
      this.scrumSheet.setSumInContractRow(SCRUM_FIRST_DATA_ROW, defaultItems.tasks.length); //musi być tutaj po zakończeniu dodawania wierszy zadań
      this.scrumSheet.getTimesRange(SCRUM_FIRST_DATA_ROW+7, 5).copyTo(this.scrumSheet.getTimesRange(SCRUM_FIRST_DATA_ROW+1,5));
      scrumMakeTimesSummary();
    } catch (e) {
      Logger.log('createDefaultTasksInScrum error');
      throw e;
    } finally {
      if (conn && !conn.isClosed()) conn.close();
    }
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    var conn = (externalConn)? externalConn : connectToSql();
    conn.setAutoCommit(false);
    
    try {
      var stmt = conn.prepareStatement('UPDATE Contracts ' +
                                       'SET Number=?,Name=?,Alias=?,ourIdRelated=?,ProjectOurId=?, StartDate=?, EndDate=?, Value=?, Comment=?,Status=?,MeetingProtocolsGdFolderId=? ' +
                                       'WHERE Id = ?;');
      var test = prepareValueToSql(this.projectId,true);
      stmt.setString(1, prepareValueToPreparedStmtSql(this.number));
      stmt.setString(2, prepareValueToPreparedStmtSql(this.name));
      stmt.setString(3, prepareValueToPreparedStmtSql(this.alias));
      stmt.setString(4, prepareValueToPreparedStmtSql(this.ourIdRelated));
      stmt.setString(5, prepareValueToPreparedStmtSql(this.projectId));
      stmt.setString(6, prepareValueToPreparedStmtSql(this.startDate));
      stmt.setString(7, prepareValueToPreparedStmtSql(this.endDate));
      stmt.setString(8, prepareValueToPreparedStmtSql(this.value));
      stmt.setString(9, prepareValueToPreparedStmtSql(this.comment));
      stmt.setString(10, prepareValueToPreparedStmtSql(this.status));
      stmt.setString(11, prepareValueToPreparedStmtSql(this.meetingProtocolsGdFolderId));
      stmt.setLong(12, this.id);
      stmt.addBatch();
      var batch = stmt.executeBatch();
      
      if (this.ourId) this.editOurContractInDb(conn);
      conn.commit();
    } catch (e) {
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  },
  
  editOurContractInDb: function(conn, isPartOfTransaction) {
    var stmt = conn.prepareStatement('UPDATE OurContractsData SET ' +
                                      'OurId = ?, ManagerId = ?, AdminId = ?, ContractURL = ? ' +
                                      'WHERE Id = ?;');
    stmt.setString(1, prepareValueToPreparedStmtSql(this.ourId));
    stmt.setString(2, prepareValueToPreparedStmtSql(this._manager.id));
    stmt.setString(3, prepareValueToPreparedStmtSql(this._admin.id));
    stmt.setString(4, prepareValueToPreparedStmtSql(this.contractUrl));
    stmt.setLong(5, this.id);
    
    stmt.addBatch();
    stmt.executeBatch();

    Logger.log('ourContract edited: ' + this.ourId);
  },
  
  editOurContractInScrum: function(){
    var firstRow = findFirstInRange(this.ourId, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_OUR_ID) + 1;
    
    if (firstRow){
      var lastRow = findLastInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_DB_ID) + 1;
      var rowsQuantity = lastRow - firstRow + 1;
      
      SCRUM_SHEET.getRange(firstRow, SCRUM_COL_PROJECT_ID+1, rowsQuantity).setValue(this.projectId);
      SCRUM_SHEET.getRange(firstRow, SCRUM_COL_CONTRACT_OUR_ID+1, rowsQuantity).setValue(this.ourId);
      SCRUM_SHEET.getRange(firstRow, SCRUM_COL_CONTRACT_DB_ID+1, rowsQuantity).setValue(this.id);
      
      //zmień dane w nagłowku
      var ourId_Alias = this.ourId;
      ourId_Alias += (this.alias)? ' [' + this.alias + ']': '';
      
      SCRUM_SHEET.getRange(firstRow, SCRUM_COL_PROJECT_ID+1, 1,SCRUM_COL_TASK_OWNER_NAME+1)
        .setValues([[this.projectId,
                    0,
                    this.ourId,0,0,0,0,
                    this._manager.id,'',
                    '=HYPERLINK("'+ this._gdFolderUrl + '";"'+ ourId_Alias + ' ' + this.scrumSheet.getOwnerNameById(this._manager.id) + '")',
                    '','','','d','d','d','d','d'
                   ]])
      SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
    } 
  },
  /* przy zmianie numeru kontraktu trzeba podmienić go w wierszaz dotyczącymi go kamieniami milowymi
   *
   */
  editWorksContractInScrum: function(){
    if (this._ourContract && this._ourContract.id){
      var firstRow = findFirstInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_DB_ID) +1;
      if (firstRow){
        var lastRow = findLastInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_DB_ID) +1;
        //Logger.log('editWorksContractInScrum:: first: %s, last %s', firstRow, lastRow);
    
        //var rowsQuantity = lastRow - firstRow;
        //aby umożliwić przypisanie kontraktu na roboty do wielu ourContracts używam tu pętli zamiast setValues
        
        for(var i=firstRow; i<=lastRow; i++) {
          //Logger.log('editWorksContractInScrum:: i = %s, %s', i, SCRUM_SHEET.getRange(i, SCRUM_COL_CONTRACT_NUMBER+1).getValue());
          SCRUM_SHEET.getRange(i, SCRUM_COL_CONTRACT_NUMBER+1).setValue(this._ourIdOrNumber_Alias);
        }
      }
    }
  },
  
  deleteFromDb: function (conn, isPartOfTransaction){
    deleteFromDb ('Contracts', this, conn, isPartOfTransaction);
  },
  
  deleteEntitiesAssociationsFromDb: function(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    try {
      var stmt = conn.createStatement();
      stmt.executeUpdate('DELETE FROM Contracts_Entities WHERE ' +
                         'ContractId =' + prepareValueToSql(this.id));
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  },
  
  deleteFromScrum: function(){  
    if(this.isOur())
      this.deleteOurContractFromScrum();
    else if(this.ourIdRelated)
      this.deleteWorksContractFromScrum();
  },
  
  deleteOurContractFromScrum: function(){  
    var firstRow = findFirstInRange(this.ourId, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_OUR_ID) + 1;
    if (firstRow){
      var lastRow = findLastInRange(this.ourId, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_OUR_ID) + 1;
      var rowsQuantity = lastRow - firstRow + 1;
      
      //kopiuj #Times
      var timesRange = SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, SCRUM_COL_TIMES+1,rowsQuantity, SCRUM_SHEET.getLastColumn()-SCRUM_COL_TIMES+1);
      var timesRangeFormulas = timesRange.getFormulas(); 
      
      SCRUM_SHEET.deleteRows(firstRow, rowsQuantity);
      if(firstRow<13){
        //odtwórz #TimesSummary i #Times
        timesRange.setFormulas(timesRangeFormulas);  
        scrumMakeTimesSummary();
      }
    }
  },
  
  deleteWorksContractFromScrum: function(){  
    var firstRow = findFirstInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_DB_ID) + 1;
    if (firstRow){
      var lastRow = findLastInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_DB_ID) + 1;
      var rowsQuantity = lastRow - firstRow + 1;
      Logger.log('FIrstRow: ' + firstRow + ' lastRow: ' + lastRow);
      //kopiuj #Times
      var timesRange = SCRUM_SHEET.getRange(SCRUM_FIRST_DATA_ROW, SCRUM_COL_TIMES+1,rowsQuantity, SCRUM_SHEET.getLastColumn()-SCRUM_COL_TIMES+1);
      var timesRangeFormulas = timesRange.getFormulas(); 
      
      SCRUM_SHEET.deleteRows(firstRow, rowsQuantity);
      if(firstRow<13){
        //odtwórz #TimesSummary i #Times
        timesRange.setFormulas(timesRangeFormulas);  
        scrumMakeTimesSummary();
      }
    }
  },
  
  getPersonDbId: function(email){
    try {
      var conn = connectToSql();
      var stmt = conn.createStatement();
      var results = stmt.executeQuery('SELECT Persons.Id FROM Persons \n' +
                                      'WHERE Persons.Email="' + email + '"');
      var end = new Date();
      //pobierz do gsheet Id krotki z bazy - potrzebne przy edycji
      results.last();
      return results.getLong(1);
    } catch (e) {
      throw e;
    } finally {
      conn.close();
    }    
  },
  
  getType: function(ourId){
      return ourId.substring(ourId.indexOf('.')+1,ourId.lastIndexOf('.'));
  },
  
  getMilestones: function(){
    return getMilestonesListPerProject(this.projectId, this.id);
  },
  
  /*
   * Wykorzystywana w Gd do tworzenia folderów dla typów spraw dla kamieni milowych
   */
  getCaseTypes: function(initParamObject){
    if(!initParamObject) initParamObject = {};
    try {  
      var result = [];
      var conn = connectToSql();
      var stmt = conn.createStatement();
      
      var isDefaultCondition= (initParamObject.isDefaultOnly)? 'CaseTypes.IsDefault=TRUE' : '1';
      var isInScrumDefaultCondition = (initParamObject.isInScrumByDefaultOnly)? 'CaseTypes.IsInScrumByDefault=TRUE' : '1';
      
      var sql = 'SELECT  CaseTypes.Id, \n \t' +
                        'CaseTypes.Name, \n \t' +
                        'CaseTypes.FolderNumber, \n \t' +
                        'CaseTypes.IsInScrumByDefault, \n \t' +
                        'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
                        'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
                        'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
                        'MilestoneTypes_ContractTypes.IsDefault AS MilestoneTypeIsDefault \n' +
                 'FROM CaseTypes \n' +
                 'JOIN MilestoneTypes ON CaseTypes.MilestoneTypeId=MilestoneTypes.Id \n' +
                 'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId = MilestoneTypes.Id AND MilestoneTypes_ContractTypes.ContractTypeId=' + this._type.id + ' \n' +
                 'WHERE ' + isDefaultCondition + ' AND ' + isInScrumDefaultCondition + ' \n' +
                 'ORDER BY MilestoneTypes.Id';
      //Logger.log(sql);
      var dbResults = stmt.executeQuery(sql);
      while (dbResults.next()) {
        var item = new CaseType({id: dbResults.getLong('Id'),
                                 name: dbResults.getString('Name'),
                                 folderNumber: dbResults.getString('FolderNumber'),
                                 isInScrumByDefault: dbResults.getBoolean('IsInScrumByDefault'),
                                 _milestoneType: new MilestoneType ({id: dbResults.getLong('MilestoneTypeId'),
                                                                     name: dbResults.getString('MilestoneTypeName'),
                                                                     _folderNumber: dbResults.getString('MilestoneTypeFolderNumber'),
                                                                     _isDefault: dbResults.getBoolean('MilestoneTypeIsDefault')
                                                                    })
                                });
        
        result.push(item);
      }
      return result;
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      conn.close();
    }
  }
}

function test_getContractsListPerProject(){
  getContractsListPerProject({projectId:'KOB.GWS.01.WLASNE'});
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  Contracts_Entities * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */
function ContractEntity(initParamObject) {
  if(initParamObject){
    this.contractId = initParamObject._contract.id;
    this._contract = initParamObject._contract;
    this.entityId = initParamObject._entity.id;
    this._entity = initParamObject._entity;
    
    this.contractRole = initParamObject.contractRole;
    //id jest usuwane w addInDb(), więc przy asocjacjach musi byś ręcznie odtworeone w controllerze
    this.id = '' + this.contractId + this.entityId;
    Logger.log('this is: ' + this.id);
  }
}


ContractEntity.prototype = {
  constructor: ContractEntity,
  
  addInDb: function(externalConn, isPartOfTransaction) {
    var conn = (externalConn)? externalConn : connectToSql();
    addInDb('Contracts_Entities', this, externalConn, isPartOfTransaction);
  }
}