function Milestone(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    //id tworzone tymczosowo po stronie klienta do obsługi tymczasowego wiersza resultsecie
    this._tmpId = initParamObject._tmpId;
    this.name = initParamObject.name;
    this._folderNumber = initParamObject._folderNumber;
    if (initParamObject.description !== undefined) // musi być sprawdzenie undefined, żeby obsłużyć pusty ciąg
      this.description = initParamObject.description;
    
    initParamObject.startDate = dateDMYtoYMD(initParamObject.startDate);
    this.startDate = (initParamObject.startDate)? Utilities.formatDate(new Date(initParamObject.startDate), "CET", "yyyy-MM-dd") : undefined;
    
    initParamObject.endDate = dateDMYtoYMD(initParamObject.endDate);
    this.endDate = (initParamObject.endDate)? Utilities.formatDate(new Date(initParamObject.endDate), "CET", "yyyy-MM-dd") : undefined;
    this.status = initParamObject.status;
    if (initParamObject.gdFolderId) {
      this.setGdFolderId(initParamObject.gdFolderId);
    }
    if(initParamObject._type){
      this.typeId = initParamObject._type.id;
      this._type = initParamObject._type;
      this.setGdFolderName(); 
    }
    
    if (initParamObject._parent){
      this.contractId = initParamObject._parent.id;
      this._parent = initParamObject._parent;
    }
  }
}

Milestone.prototype = {
  constructor: Milestone,
  
  getCases: function(){
    return getCasesListPerMilestone(this.id);
  },
  
  setGdFolderId: function(gdFolderId){
    this.gdFolderId = gdFolderId;
    this._gdFolderUrl = Gd.createGdFolderUrl(gdFolderId);
  },
  
  setGdFolderName: function(){
    if(this._type._folderNumber)
      this._folderName = this._type._folderNumber + ' ' + this._type.name;
  },
  /*
   * Tworzy domyślne sprawy i zapisuje je w db
   * argument: {foldersGdData, defaultCaseTemplates, externalConn, isPartOfTransaction}
   */
  createDefaultCasesInDb: function(initParamObject){
    var conn = (initParamObject.externalConn)? initParamObject.externalConn : connectToSql();
    //defaultTasks = [] na tym poziome scala zadania do wszystkich spraw w kamieniu
    var defaultCaseItems = [], allDefaultCasesDefaultTasks = []; 
    
    //jeżeli nie podano argumentu zawęź szablony do bieżącego typu kamienia
    if(!initParamObject.defaultCaseTemplates)
      initParamObject.defaultCaseTemplates = getCaseTemplatesListPerMilestoneType({milestoneTypeId: this._type.id,
                                                                                   isDefaultOnly: true
                                                                                  },conn);
    if (initParamObject.defaultCaseTemplates.length==0 && this.isOur) throw new Error('Typ kontraktu, który próbujesz dodać nie ma przypisanego żadnego szablonu sprawy!\n' +
                                                                                      'Zgłoś administratorowi potrzebę utworzenia szablonów spraw i zadań'
                                                                                     );
    if(!initParamObject.defaultTaskTemplates)
      initParamObject.defaultTaskTemplates = getTaskTemplatesListPerContractType({contractTypeId: this._parent._type.id,
                                                                                  isDefaultOnly: true
                                                                                 },conn)
      if (initParamObject.defaultTaskTemplates.length==0 && this.isOur) throw new Error('Typ kontraktu, który próbujesz dodać nie ma przypisanego żadnego szablonu zadania!\n' +
                                                                                        'Zgłoś administratorowi potrzebę utworzenia szablonów zadań'
                                                                                       );
    
    for(var j=0; j<initParamObject.defaultCaseTemplates.length; j++){
      var currentCaseItem = this.createDefaultCase({template: initParamObject.defaultCaseTemplates[j], 
                                                    foldersGdData: initParamObject.foldersGdData, 
                                                    externalConn: conn})
      if (currentCaseItem){ 
        defaultCaseItems.push(currentCaseItem); 
        var dafaultTasks =  currentCaseItem.createDefaultTasksInDb({defaultTaskTemplates: initParamObject.defaultTaskTemplates, 
                                                                    externalConn: conn
                                                                   });
        allDefaultCasesDefaultTasks = allDefaultCasesDefaultTasks.concat(dafaultTasks);
      }
    }
    //do wykorzystania w this.createDefaultTasksInScrum()
    return {caseItems: defaultCaseItems,
            tasks: allDefaultCasesDefaultTasks
           };
  },
  
  /*
   * tworzy domyślną sprawę i zapisuje ją w db
   * initParamObject: {template, foldersGdData, conn}
   */
  createDefaultCase: function(initParamObject){
    if(this._type.id == initParamObject.template._caseType._milestoneType.id){
      var currentCase = new Case({name: initParamObject.template.name,
                                  description: initParamObject.template.description, 
                                  _type: initParamObject.template._caseType,
                                  _parent: this
                                 });
      addNewProcessInstancesForCaseInDb(currentCase, initParamObject.externalConn, true)
      Logger.log('\n Dodaję sprawę: ' + currentCase._type.name + ' ' + currentCase.name + '\n isUniquePerMilestone ' + currentCase._type.isUniquePerMilestone)
      
      //zasymuluj numer sprawy nieunikalnej. UWAGA: założenie, że przy dodawaniu spraw domyślnych nie będzie więcej niż jedna sprawa tego samego typu
      if(!currentCase._type.isUniquePerMilestone){
        currentCase.number=1;
        currentCase.setDisplayNumber();
        var gd = new Gd(undefined);
        var caseFolder = gd.createCaseFolder(currentCase)
        caseFolder.setName(currentCase._folderName);
        Logger.log('Folder sprawy nieunikalnej: ' + currentCase._folderName);
      } else
        this._parent.setDefaultsubItemFolderIdFromFoldersData(currentCase, initParamObject.foldersGdData);

      currentCase.addInDb(initParamObject.externalConn, true);
      addNewProcessInstancesForCaseInDb(currentCase, initParamObject.externalConn, true)
      return currentCase;
    }
  },

  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('Milestones', this, conn, isPartOfTransaction);
  },
  
  //wykorzystywany przy dodawaniu zapomnianych milestonów
  addInScrum: function(format){
    //dodaj odpowiednią sprawę
    var currentCase = new Case({ _parent: {id: this.id},
                                 name: 'zakończ kamień milowy'
                               });
    currentCase.id = currentCase.getIdFromDb();
    var currentCaseId = (currentCase.id)? currentCase.id : currentCase.addInDb();
    //dodaj odpowiednie zadanie
    var currentTask = new Task();
    currentTask.name = 'Zakończ kamień milowy lub zaktualizuj termin wykonania';
    currentTask.status = 'Nie rozpoczęty';
    currentTask.caseId = currentCaseId;
    currentTask.deadline = this.endDate;
    if(this._parent && this._parent._manager)
      currentTask.ownerId = this._parent._manager.id;
    
    var conn = connectToSql();
    try{
      currentTask.addInDb(conn);
      currentTask.addInScrum(conn,'SKIP_MAKE_TIMES_SUMMARY',format);
      
      conn.commit();
      
    } finally {
      conn.close();
    }      
  },
  
  getContractDbId: function(ourContractId){
    try {
      var conn = connectToSql();
      var stmt = conn.createStatement();
      var results = stmt.executeQuery('SELECT Contracts.Id, OurContractsData.OurId FROM Contracts \n' +
                                      'JOIN OurContractsData ON Contracts.Id = OurContractsData.Id  \n' +
                                      'WHERE OurContractsData.OurId ="' + ourContractId + '"');
      var end = new Date();
      //pobierz do gsheet Id krotki z bazy - potrzebne przy edycji
      results.last();
      return results.getInt(1);
    } catch (e) {
      Logger.log('getContractDbId :' + ourContractId);
      throw e;
    } finally {
      conn.close();
    }    
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('Milestones', this, externalConn, isPartOfTransaction);
  },
  
  editInScrum: function(){
    var firstRow = findFirstInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID) + 1;
    if (firstRow){
      var lastRow = findLastInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID) + 1;
      var rowsQuantity = lastRow - firstRow + 1;
      if (!this._parent.ourId)
        SCRUM_SHEET.getRange(firstRow, SCRUM_COL_CONTRACT_NUMBER+1,rowsQuantity).setValue(this._parent.number);
      
      var caption;
      if (this.gdFolderId){
        var nameCaption = (this.name)? ' | ' + this.name : ''
        caption = '=HYPERLINK("'+ this._gdFolderUrl + '";"'+ this._type._folderNumber + ' ' + this._type.name + nameCaption + '")'
      }
      else
        caption = this._type._folderNumber + ' ' + this._type.name + ' ' + this.name
      SCRUM_SHEET.getRange(firstRow, SCRUM_COL_MILESTONE_NAME+1,rowsQuantity)
        .setValue(caption);
    }
  },
  
  deleteFromDb: function (){
    deleteFromDb ('Milestones', this);
  },
  
  deleteFromScrum: function(){  
    var firstRow = findFirstInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID) + 1;
    if (firstRow){
      var lastRow = findLastInRange(this.id, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID) + 1;
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

  getCaseTypes: function(){
    try {  
      var result = [];
      var conn = connectToSql();
      var stmt = conn.createStatement();
      
      var sql = 'SELECT  CaseTypes.Id, \n \t' +
                        'CaseTypes.Name, \n \t' +
                        'CaseTypes.FolderNumber, \n \t' +
                        'CaseTypes.IsInScrumByDefault, \n \t' +
                        'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
                        'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
                        'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
                        'MilestoneTypes_ContractTypes.IsDefault AS MilestoneTypeIsDefault \n' +
                 'FROM CaseTypes \n' +
                 'JOIN MilestoneTypes ON MilestoneTypes.Id=CaseTypes.MilestoneTypeId AND MilestoneTypes.Id=' + this._type.id +' \n' +
                 'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId = MilestoneTypes.Id AND MilestoneTypes_ContractTypes.ContractTypeId=' + this._parent._type.id + ' \n' +
                 'ORDER BY MilestoneTypeId';
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