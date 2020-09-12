class Case {
  id?: number;
  number?: number;
  _wasChangedToUniquePerMilestone?: boolean;
  name?: string;
  description?: string;
  _type?: any;
  typeId?: number;
  _typeFolderNumber_TypeName_Number_Name?: string;
  _displayNumber?: string;
  milestoneId?: number;
  _parent?: any;
  _risk: any;
  _processesInstances?: any[];
  gdFolderId?: string;
  _gdFolderUrl?: string;
  _folderName?: string;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.number = initParamObject.number;
      if (initParamObject._type.isUniquePerMilestone && this.number) this._wasChangedToUniquePerMilestone = true;

      this.name = (initParamObject.name !== '') ? initParamObject.name : undefined;
      if (initParamObject.description !== undefined) // musi być sprawdzenie undefined, żeby obsłużyć pusty ciąg
        this.description = initParamObject.description;
      if (initParamObject._type) {
        this._type = initParamObject._type;
        if (initParamObject._type.id)
          this.typeId = initParamObject._type.id;

        this.setDisplayNumber(); //ustawia też this._folderName - uruchamia this.setGdFolderName();
        this._typeFolderNumber_TypeName_Number_Name = this._type.folderNumber + ' ' + this._type.name;
        if (!this._type.isUniquePerMilestone)
          this._typeFolderNumber_TypeName_Number_Name += ' | ' + this._displayNumber + ' ' + this.name;
      }
      if (initParamObject.gdFolderId) {
        this.setGdFolderId(initParamObject.gdFolderId);
      }
      if (initParamObject._parent) {
        this.milestoneId = initParamObject._parent.id;
        this._parent = initParamObject._parent;
      }
      this._risk = initParamObject._risk;
      this._processesInstances = (initParamObject._processesInstances) ? initParamObject._processesInstances : [];
    }
  }


  setGdFolderId(gdFolderId) {
    this.gdFolderId = gdFolderId;
    this._gdFolderUrl = Gd.createGdFolderUrl(gdFolderId);
  }
  setAsUniquePerMilestone() {
    this.number = undefined;
    this.name = null;
  }
  //ustawia numer do wyświetlenia w sytemie na podstawie danych z bazy
  setDisplayNumber() {
    var _displayNumber;
    if (!this.number)
      _displayNumber = '00'
    else if (this.number < 10)
      _displayNumber = '0' + this.number
    else
      _displayNumber = this.number;
    _displayNumber = 'S' + _displayNumber;
    this._displayNumber = _displayNumber;
    this.setGdFolderName();
  }

  setGdFolderName() {
    var caseName = (this.name) ? ' ' + this.name : '';
    this._folderName = this._displayNumber + caseName;

    if (this._wasChangedToUniquePerMilestone)
      this._folderName += ' - przenieś pliki i usuń folder'
    else if (this._type.isUniquePerMilestone)
      this._folderName = this._type.folderNumber + ' ' + this._type.name;
  }

  initFromScrum(row) {
    this.id = SCRUM_DATA_VALUES[row][SCRUM_COL_CASE_ID];
    this.name = SCRUM_DATA_VALUES[row][SCRUM_COL_CASE_NAME];
    this.milestoneId = SCRUM_DATA_VALUES[row][SCRUM_COL_MILESTONE_ID];
  }
  //zwraca id z arkusza danych w scrum, który jest synchronizowany z db
  getIdFromDb() {
    var id;
    for (var i = 1; i < SCRUM_DATA_DATA_VALUES.length; i++) {
      if (SCRUM_DATA_DATA_VALUES[i][SCRUM_DATA_COL_CASE_TYPE_ID] == this.typeId &&
        SCRUM_DATA_DATA_VALUES[i][SCRUM_DATA_COL_CASE_MILESTONE_ID] == this.milestoneId &&
        SCRUM_DATA_DATA_VALUES[i][SCRUM_DATA_COL_CASE_NAME] == this.name)
        return SCRUM_DATA_DATA_VALUES[i][SCRUM_DATA_COL_CASE_ID];
    }
  }

  getNumberFromDb(externalConnection, isPartOfTransaction) {
    try {
      var conn = (externalConnection) ? externalConnection : connectToSql();
      var stmt = conn.createStatement();
      var results = stmt.executeQuery('SELECT Cases.Number FROM Cases \n' +
        'WHERE Cases.Id ="' + this.id + '"');
      var end = new Date();
      results.last();
      Logger.log('Case.getNumberFromDb:: ' + results.getInt(1));
      return results.getInt(1);
    } catch (e) {
      Logger.log('getNumberFromDb error');
      throw e;
    } finally {
      //if (!isPartOfTransaction) conn.close();
    }
  }
  //zwraca id z arkusza danych w scrum, który jest synchronizowany z db
  isSavedInDb() {
    for (var i = 1; i < SCRUM_DATA_DATA_VALUES.length; i++) {
      var id = SCRUM_DATA_DATA_VALUES[i][SCRUM_DATA_COL_CASE_ID];
      if (id == this.id)
        return id;
    }
  }

  /*
   * Tworzy domyślne sprawy i zapisuje je w db
   * argument: {defaultTaskTemplates, externalConn, isPartOfTransaction}
   */
  createDefaultTasksInDb(initParamObject) {
    var conn = (initParamObject.externalConn) ? initParamObject.externalConn : connectToSql();
    var defaultTasks = [];

    for (var k = 0; k < initParamObject.defaultTaskTemplates.length; k++) {
      var currentTask = this.createDefaultTask({
        template: initParamObject.defaultTaskTemplates[k],
        externalConn: initParamObject.externalConn
      });
      if (currentTask) defaultTasks.push(currentTask);
    }
    return defaultTasks;
  }
  /*
   * tworzy domyślne zadanie i zapisuje je w db, dodaje też zadanie do Scruma
   * initParamObject: {template, externalConn}
   */
  createDefaultTask(initParamObject) {
    if (this._type.id == initParamObject.template._caseTemplate._caseType.id) {
      var currentTask = new Task({
        name: initParamObject.template.name,
        description: initParamObject.template.description,
        status: (initParamObject.template.status) ? initParamObject.template.status : 'Nie rozpoczęty',
        //deadline: template.deadline,
        _parent: this,
        _owner: (this._parent) ? this._parent._parent._manager : undefined
      });
      //if (this._admin.id) currentTask.ownerId = this._admin.id;
      currentTask.addInDb(initParamObject.externalConn, true);
      return currentTask;
    }
  }

  addInDb(conn?, isPartOfTransaction?) {
    addInDb('Cases', this, conn, true);
    //if(!this._type.isUniquePerMilestone) 
    this.number = this.getNumberFromDb(conn, isPartOfTransaction);
    this.setDisplayNumber();
  }
  /*
   * Dodaje sprawę do arkusza danych
   */
  addInScrum() {
    var nameCaption;
    if (this.gdFolderId)
      nameCaption = '=HYPERLINK("' + this._gdFolderUrl + '";"' + this.name + '")'
    else
      nameCaption = (this.name) ? this.name : '';

    var lastCaseDataRow = getColumnArray(SCRUM_DATA_DATA_VALUES, SCRUM_COL_MILESTONE_ID).length;
    var caseData = [[
      this.id,
      this.typeId,
      this.milestoneId,
      nameCaption,
      (this.gdFolderId) ? this.gdFolderId : ''
    ]]
    SCRUM_DATA_SHEET.getRange(lastCaseDataRow + 1, SCRUM_DATA_COL_CASE_ID + 1, 1, 5).setValues(caseData);
    SCRUM_DATA_DATA_VALUES = SCRUM_DATA_SHEET.getDataRange().getValues();
  }

  editInDb(externalConn, isPartOfTransaction) {
    editInDb('Cases', this, externalConn, isPartOfTransaction);
  }

  editInScrum() {
    //edytuj wiersz bazy w arkuszu Data
    var caseDataRow = findFirstInRange(this.id, SCRUM_DATA_DATA_VALUES, SCRUM_DATA_COL_CASE_ID);

    var caseData = [[
      this.id,
      this.typeId,
      this.milestoneId,
      (this.name) ? this.name : '',
      (this.gdFolderId) ? this.gdFolderId : ''
    ]]
    SCRUM_DATA_SHEET.getRange(caseDataRow + 1, SCRUM_DATA_COL_CASE_ID + 1, 1, 5).setValues(caseData);

    //edytuj wiersze ze scruma
    var firstMilestoneRow = findFirstInRange(this.milestoneId, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID);
    if (firstMilestoneRow) {
      var lastMilestoneRow = findLastInRange(this.milestoneId, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID);
      var rowsQuantity = lastMilestoneRow - firstMilestoneRow + 1;
      for (var i = firstMilestoneRow; i <= lastMilestoneRow; i++) {
        if (SCRUM_DATA_VALUES[i][SCRUM_COL_CASE_ID] == this.id) {
          var nameCaption;
          if (this.gdFolderId && this.name)
            nameCaption = '=HYPERLINK("' + this._gdFolderUrl + '";"' + this.name + '")'
          else
            nameCaption = (this.name) ? this.name : ''

          SCRUM_SHEET.getRange(i + 1, SCRUM_COL_CASE_TYPE + 1, 1, 2)
            .setValues([[this._type.folderNumber + ' ' + this._type.name + ' | ' + this._displayNumber,
              nameCaption
            ]]);
        }
      }
    }
  }

  deleteFromDb() {
    deleteFromDb('Cases', this, undefined, undefined);
  }

  deleteFromScrum() {
    var firstMilestoneRow = findFirstInRange(this.milestoneId, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID);
    if (firstMilestoneRow) {
      var lastMilestoneRow = findLastInRange(this.milestoneId, SCRUM_DATA_VALUES, SCRUM_COL_MILESTONE_ID);
      var rowsQuantity = lastMilestoneRow - firstMilestoneRow + 1;
      var lastDeletedRow;
      //usuń wiersze ze scruma
      for (var i = firstMilestoneRow; i <= lastMilestoneRow; i++) {
        if (SCRUM_DATA_VALUES[i][SCRUM_COL_CASE_ID] == this.id) {
          SCRUM_SHEET.deleteRow(i + 1);
          lastDeletedRow = i + 1;
        }
      }
      //TODO: dorobić 
      if (lastDeletedRow < 13) {
        //var headerContractRow = findFirstInRange(ourContractOurId, SCRUM_DATA_VALUES, SCRUM_COL_CONTRACT_OUR_ID) + 1;
        //scrumMakeTimesSummary();
      }
    }
    SCRUM_DATA_VALUES = SCRUM_SHEET.getDataRange().getValues();
    //usuń wiersz bazy w arkuszu Data
    var caseDataRow = findFirstInRange(this.id, SCRUM_DATA_DATA_VALUES, SCRUM_DATA_COL_CASE_ID);
    if (caseDataRow) {
      SCRUM_DATA_SHEET.deleteRow(caseDataRow + 1);
      //Logger.log(caseDataRow+1);
    }
  }
  /*
   * sprawdza czy sprawa ma podpiętą instancję procesu danego typu
   */
  hasProcessConnected(processId) {
    for (var i = 0; i < this._processesInstances.length; i++)
      if (this._processesInstances[i]._process.id == processId) {
        Logger.log('hasProcessConnected:: ' + this._processesInstances[i]._process.id + ' == ' + processId);
        return true;
      }

    return false;
  }
}

function test_deleteCase() {
  deleteCase('')
}