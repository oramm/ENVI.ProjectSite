/* 1. Wniosek materiałowy jest szczególnym typem sprawy
 * 2. Każdy wniosek jest przypisany do kamienia '04 Roboty Nadzór' i do unikalnej  sprawy typu '07.01 Wnioski Materiałowe'
 * 3. Cykl życia sprawy wniosku jest powiązany z cyklem życia powiązanych zadań (CRUD) - dodanie/edycja/usunięcie wniosku tworzy/zmienia/kasuje powiązane zadania
 */
 
function MaterialCard(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    this.status = initParamObject.status;
    this.creationDate = initParamObject.creationDate;
    initParamObject.creationDate = dateDMYtoYMD(initParamObject.creationDate);
    this.creationDate = (initParamObject.creationDate)? Utilities.formatDate(new Date(initParamObject.creationDate), "CET", "yyyy-MM-dd") : undefined;
    
    this.deadline = initParamObject.deadline;
    this.lastUpdated = initParamObject.lastUpdated;
    this._editor = initParamObject._editor;
    this._owner = initParamObject._owner;
    if(initParamObject._owner)
      this.ownerId = initParamObject._owner.id;
    this._contractId = initParamObject._contractId;
    this._case = (initParamObject._case)? initParamObject._case : this.getCaseData(initParamObject.externalConn);
    this.caseId = this._case.id;
    this.gdFolderId = initParamObject.gdFolderId;
    this._gdFolderUrl = Gd.createGdFolderUrl(this.gdFolderId);
  }
}

MaterialCard.prototype = {
  constructor: MaterialCard,
  getCaseData: function(conn){
    var stmt = conn.createStatement();
    var query = 'SELECT \n \t' +
                  'Cases.Id, \n \t' +
                  'Cases.Number, \n \t' +
                  'Cases.Name, \n \t' +
                  'Cases.Description, \n \t' +
                  'Cases.GdFolderId, \n \t' +
                  'CaseTypes.Id AS TypeId, \n \t' +
                  'CaseTypes.Name AS TypeName, \n \t' +      
                  'CaseTypes.FolderNumber AS TypeFolderNumber \n' +
                'FROM Cases \n' +
                'JOIN CaseTypes ON CaseTypes.Id=Cases.TypeId \n' +
                'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
                'JOIN Contracts  ON Milestones.ContractId = Contracts.Id \n' +
                'WHERE Contracts.Id = ' + this._contractId + ' AND CaseTypes.Id=51';
    Logger.log(query)
    var dbResults = stmt.executeQuery(query);
    dbResults.last();
    return new Case ({id: dbResults.getLong('Id'),
                      number: dbResults.getInt('Number'),
                      gdFolderId: dbResults.getString('GdFolderId'),
                      _type: {id: dbResults.getLong('TypeId'),
                              name: dbResults.getString('TypeName'),
                              folderNumber: dbResults.getString('TypeFolderNumber')
                             }
                     });
  },
  
  setGdFolderName: function(){
    return this.id + ' ' + this.name;
  },
  
  addInDb: function(conn) {
    addInDb('MaterialCards', this, conn, true);
  },
  
  createDefaultTasksInDb: function(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    var defaultTaskTemplates = getTaskTemplatesListPerCaseType(this._case._type.id, externalConn);
    var _this = this;
    defaultTaskTemplates.map(function(item){item.name += ': ' + _this.setGdFolderName()})
    var tasks = this._case.createDefaultTasksInDb({defaultTaskTemplates: defaultTaskTemplates,
                                                   externalConn: externalConn
                                                  });
    return tasks;
  },
  
  createDefaultTasksInScrum: function(tasks){
    var conn = connectToSql();
    try{
      var minRow=0;
      //dodaj zadania do scruma
      for (var i=0; i<tasks.length; i++){
        var taskScrumData = tasks[i].addInScrum(conn,'SKIP_MAKE_TIMES_SUMMARY');
        if(taskScrumData){
          var lastContractRow = taskScrumData.lastContractRow;
          if(minRow>lastContractRow || !minRow) minRow = lastContractRow;
        }
      }
      //var scrumSheet = new ScrumSheet();
      //scrumSheet.setSumInContractRow(SCRUM_FIRST_DATA_ROW, tasks.length); //musi być tutaj po zakończeniu dodawania wierszy zadań
      //scrumSheet.getTimesRange(SCRUM_FIRST_DATA_ROW+7, 5).copyTo(this.scrumSheet.getTimesRange(SCRUM_FIRST_DATA_ROW+1,5));
      if(minRow && minRow<13)
        scrumMakeTimesSummary();
    } catch (e) {
      Logger.log('createDefaultTasksInScrum error');
      throw e;
    } finally {
      if (conn && conn.isValid(0)) conn.close();
    }
  },
  
  createGdFolder: function(){
    var gd = new Gd();
    var rootFolder = DriveApp.getFolderById(this._case.gdFolderId);
    return gd.setFolder(rootFolder, this.setGdFolderName());
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('MaterialCards', this, externalConn, isPartOfTransaction);
  },
  
  //prostszy wariant niż dla spraw - ma opcji zmiany typu sprawy
  editGdFolderName: function(){
    var folder = DriveApp.getFolderById(this.gdFolderId);
    folder.setName(this.setGdFolderName());
  }, 
  
  deleteFromDb: function (){
    deleteFromDb ('MaterialCards', this);
  },
  
  deleteGdFolder: function(){
    var folder = DriveApp.getFolderById(this.gdFolderId);
    if(Gd.canUserDeleteFolder(this.gdFolderId)){
      folder.setTrashed(true);
      return true;
    }
    else{
      var rootFolder = DriveApp.getFolderById(this._case.gdFolderId);
      rootFolder.removeFolder(folder);
      return false;
    }
  },
  
  deleteFromScrum: function(tasks){  
    var minRow=0;
    for (var i=0; i<tasks.length; i++){
      var row = findFirstInRange(tasks[i].id, SCRUM_DATA_VALUES, SCRUM_COL_TASK_ID) + 1;
      if (row){
        if(minRow>row || !minRow) minRow = row;
        SCRUM_SHEET.deleteRow(row);
      }
    }
    if(minRow && minRow<13){
      //odtwórz #TimesSummary i #Times
      scrumMakeTimesSummary();
    }
  },
}

function test_editMaterialCard(){
  editMaterialCard('')
}