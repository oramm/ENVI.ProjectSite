class LetterNew {
  id?: any;
  isOur?: any;
  number?: any;
  description?: any;
  creationDate?: string;
  registrationDate?: string;
  _documentOpenUrl?: any;
  letterGdId?: any;
  _fileOrFolderOwnerEmail?: string;
  _gdFolderUrl?: any;
  folderGdId?: any;
  _lastUpdated?: any;
  _contract?: any;
  _project?: any;
  projectId?: any;
  _cases?: any;
  _entitiesMain?: any;
  _entitiesCc?: any;
  letterFilesCount?: any;
  _editor?: any;
  _fileOrFolderChanged?: any;
  _template?: any;
  editorId?: any;
  _canUserChangeFileOrFolder?: any;
  _folderName?: string;
  _documentEditUrl?: string;

  constructor(initParamObject){
    if(initParamObject){
      this.id = initParamObject.id;
      this.isOur = initParamObject.isOur;
      if(initParamObject.number)
        this.number = initParamObject.number;
      this.description = initParamObject.description;
      
      initParamObject.creationDate = dateDMYtoYMD(initParamObject.creationDate);
      this.creationDate = (initParamObject.creationDate)? Utilities.formatDate(new Date(initParamObject.creationDate), "CET", "yyyy-MM-dd") : undefined;
      
      initParamObject.registrationDate = dateDMYtoYMD(initParamObject.registrationDate);
      this.registrationDate = (initParamObject.registrationDate)? Utilities.formatDate(new Date(initParamObject.registrationDate), "CET", "yyyy-MM-dd") : undefined;
      
      if(initParamObject.letterGdId){	
        this._documentOpenUrl = Gd.createDocumentOpenUrl(initParamObject.letterGdId);
        this.letterGdId = initParamObject.letterGdId;
        this._fileOrFolderOwnerEmail = DriveApp.getFileById(this.letterGdId).getOwner().getEmail();
      }
      if(initParamObject.folderGdId){	
        this._gdFolderUrl = Gd.createGdFolderUrl(initParamObject.folderGdId);
        this.folderGdId = initParamObject.folderGdId;
        this._fileOrFolderOwnerEmail = DriveApp.getFolderById(this.folderGdId).getOwner().getEmail();
      }
      this._lastUpdated = initParamObject._lastUpdated;
      this._contract = initParamObject._contract;
      this._project = initParamObject._project;
      this.projectId = initParamObject._project.id;
      this._cases = initParamObject._cases;
      this._entitiesMain = (initParamObject._entitiesMain)? initParamObject._entitiesMain : [];
      this._entitiesCc = (initParamObject._entitiesCc)? initParamObject._entitiesCc : [];
      this.letterFilesCount = (initParamObject._blobEnviObjects)? initParamObject._blobEnviObjects.length : initParamObject.letterFilesCount;
      
      this._editor = initParamObject._editor;
      
      this._fileOrFolderChanged;
      this._template = initParamObject._template;
    }
  }

  setEditorId(){
    if(this._editor.id)
      return this._editor.id;
    else
      return Person.getPersonDbId(Session.getActiveUser().getEmail(), undefined);
  }
    
  /*
   * Używana przy selekcie
   */
  canUserChangeFileOrFolder(){
    if(this.folderGdId)
      return Gd.canUserDeleteFolder(this.folderGdId);
    else if(this.letterGdId)
      return Gd.canUserDeleteFile(this.letterGdId);
  }
  
  /*
   * Używać tylko gdy mamy pojedynczego bloba - pismo przychodzące
   */
  createLetterFile(blobEnviObjects){
    if(this.letterFilesCount>1) throw new Error('Cannot create a singleFile for letter with multiple files!');
    var rootFolder = DriveApp.getFolderById(this._project.lettersGdFolderId);
    var blob = Tools._blobEnviObjectToBlob(blobEnviObjects[0]);
    var letterFile = rootFolder.createFile(blob);
    letterFile.setShareableByEditors(true);
    this.addFileToCasesFolders(letterFile);
    this.letterGdId = letterFile.getId();
    this._documentOpenUrl = Gd.createDocumentOpenUrl(this.letterGdId);
    
    this.folderGdId = undefined;
    this._gdFolderUrl = undefined;
  }
  

  /*
   * Tworzy folder i plik pisma ENVI z wybranego szablonu
   * blobEnviObjects - załączniki
   */
  createOurLetter(blobEnviObjects){
    var letterFolder = this.createLetterFolder(blobEnviObjects);
    var ourLetterFile = Gd.createDuplicateFile(this._template.gdId, letterFolder.getId(), this.number + ' ' + this.creationDate);
    ourLetterFile.setShareableByEditors(true);
    this.letterGdId = ourLetterFile.getId();
    this._documentEditUrl = ourLetterFile.getUrl();
    return letterFolder;
  }
  /*
   * Używać tylko gdy mamy pojedynczego bloba
   * dodaje plik pisma do folderów spraw powiązanych z pismem
   * file  -plik zrobiony z bloba
   */
  addFileToCasesFolders(file){
    if(this.letterFilesCount>1) throw new Error('Cannot add file to cases folders for letter with multiple files!');
    for(var i=0; i<this._cases.length; i++){
      var caseFolder = DriveApp.getFolderById(this._cases[i].gdFolderId);
      caseFolder.addFile(file); //uwaga to nie jest kopia pliku. skasowanie go powoduje usunięcie z każdego folderu
    }
  }
  
  /*
   * Używać tylko gdy mamy wiele blobów
   */
  createLetterFolder(blobEnviObjects){
    if(!this.isOur && this.letterFilesCount<2) throw new Error('Cannot create a folder for Letter with single file!');
    //var gd = new Gd(undefined)
    var rootFolder = DriveApp.getFolderById(this._project.lettersGdFolderId);
    var letterFolder = rootFolder.createFolder(this._folderName);
    letterFolder.setShareableByEditors(true);
    this.folderGdId = letterFolder.getId();
    this._gdFolderUrl = letterFolder.getUrl();
    this._fileOrFolderOwnerEmail = letterFolder.getOwner().getEmail();
    this._canUserChangeFileOrFolder = this.canUserChangeFileOrFolder();
    //letterFolder.setOwner(MY_GOOGLE_ACCOUNT_EMAIL);
    letterFolder.setShareableByEditors(true);
    for(var i=0; i<blobEnviObjects.length; i++){
      var blob = Tools._blobEnviObjectToBlob(blobEnviObjects[i]);
      var letterFile = letterFolder.createFile(blob);
    }
    this.addFolderToCasesFolders(letterFolder);
    
    this._documentOpenUrl = undefined;
    this.letterGdId=undefined;
    return letterFolder;
  }
  
  /*
   * Używać tylko gdy mamy wiele blobów
   * dodaje folder z plikami pisma do folderów spraw powiązanych z pismem
   * folder folder plików pisma
   */
  addFolderToCasesFolders(letterFolder){
    if(!this.isOur && this.letterFilesCount<2) throw new Error('There is no letterFolder to add to cases folders for letter with single file!');
    for(var i=0; i<this._cases.length; i++){
      var caseFolder = DriveApp.getFolderById(this._cases[i].gdFolderId);
      caseFolder.addFolder(letterFolder); //uwaga to nie jest kopia folderu. skasowanie go powoduje usunięcie z każdego folderu
    }
  }
  /*
   * Używać tylko gdy mamy wiele blobów
   */
  makeFolderName(){
    return this.number + ' ' + this.creationDate;
  }
  
  addInDb(externalConn, isPartOfTransaction) {
    addInDb('Letters', this, externalConn, isPartOfTransaction);
    this.addCaseAssociationsInDb(externalConn);
    this.addEntitiesAssociationsInDb(externalConn);
    if(!this.number) this.number = this.id;
  }
  
  addCaseAssociationsInDb(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    try {
      for(var i=0; i<this._cases.length; i++){
        var caseAssociation = new LetterCase({_letter: {id: this.id,
                                                       },
                                              _case: {id: this._cases[i].id
                                                     }
                                             });
        caseAssociation.addInDb(externalConn);
      }
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  }
  
  addEntitiesAssociationsInDb(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    this._entitiesMain = this._entitiesMain.map(function(item){item.letterRole = 'MAIN'; 
                                                             return item 
                                                            });
    this._entitiesCc = this._entitiesCc.map(function(item){item.letterRole = 'CC'; 
                                                             return item 
                                                            });
    var entities = this._entitiesMain.concat(this._entitiesCc); 
    try {
      for(var i=0; i<entities.length; i++){
        var entityAssociation = new LetterEntity({letterRole: entities[i].letterRole,
                                                   _letter: this,
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
  }
  
  editInDb(externalConn, isPartOfTransaction) {
    this.deleteCaseAssociationsFromDb(externalConn);
    this.deleteEntityAssociationsFromDb(externalConn);
    editInDb('Letters', this, externalConn, isPartOfTransaction);
    this.addCaseAssociationsInDb(externalConn);
    this.addEntitiesAssociationsInDb(externalConn);
  }
  
  /*
   * pismo przychodzące albo nasze pismo po staremu
   */
  editFileOrFolder(_blobEnviObjects){
    this._fileOrFolderChanged = this.deleteFromGd();
    
    if(_blobEnviObjects.length>1)
      var letterFolder = this.createLetterFolder(_blobEnviObjects);
    else
      var letterFile = this.createLetterFile(_blobEnviObjects);
    
    this._documentOpenUrl = Gd.createDocumentOpenUrl(this.letterGdId);
  }
  /*
   * _blobEnviObjects to załączniki do pisma
   */
  editOurFolder(_blobEnviObjects){
    this._fileOrFolderChanged = this.deleteFromGd();
    var letterFolder = this.createOurLetter(_blobEnviObjects);
    //this._documentOpenUrl = Gd.createDocumentOpenUrl(this.letterGdId);
  }
  
  deleteFromDb(externalConn){
    deleteFromDb ('Letters', this, undefined, undefined);
  }
  
  deleteFromGd(){
    if(this.letterGdId || this.folderGdId){
      //usuwamy folder lub plik
      if(this.canUserChangeFileOrFolder()){
        if(this.folderGdId)
          DriveApp.getFolderById(this.folderGdId).setTrashed(true);
        else
          DriveApp.getFileById(this.letterGdId).setTrashed(true);
        return true;
      }
      //zmieniamy nazwę folderu lub pliku ze wzgędu na brak uprawnień do usuwania 
      else{
        if(this.folderGdId){
          var folder = DriveApp.getFolderById(this.folderGdId)
          folder.setName(folder.getName() + '- USUŃ');
        }
        else{
          var file = DriveApp.getFileById(this.letterGdId)
          file.setName(file.getName() + '- USUŃ');
        }
        return false;
      }
    }
  }
  
  deleteCaseAssociationsFromDb(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    try {
      var stmt = conn.createStatement();
      stmt.executeUpdate('DELETE FROM Letters_Cases WHERE ' +
                         'LetterId =' + prepareValueToSql(this.id));
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  }

  deleteEntityAssociationsFromDb(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    try {
      var stmt = conn.createStatement();
      stmt.executeUpdate('DELETE FROM Letters_Entities WHERE ' +
                         'LetterId =' + prepareValueToSql(this.id));
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  }
}