class Invoice {
  id?: any;
  number: any;
  _entity: any;
  entityId: number;
  description?: string;
  status?: string;
  creationDate?: any;
  issueDate: any;
  sentDate?: any;
  paymentDeadline?: any;
  daysToPay: number;
  _lastUpdated?: any;
  _editor?: any;
  _owner?: any;
  ownerId?: number;
  editorId?: number
  contractId: number;
  _contract: any;
  _items?: InvoiceItem[];
  _project: any;
  gdId?: string;
  _documentOpenUrl: string;
  _value: number;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.number = initParamObject.number;
      this.description = initParamObject.description;
      this.status = initParamObject.status;

      initParamObject.creationDate = ToolsDate.dateDMYtoYMD(initParamObject.creationDate);
      this.creationDate = (initParamObject.creationDate) ? Utilities.formatDate(new Date(initParamObject.creationDate), "CET", "yyyy-MM-dd") : undefined;

      initParamObject.issueDate = ToolsDate.dateDMYtoYMD(initParamObject.issueDate);
      this.issueDate = (initParamObject.issueDate) ? Utilities.formatDate(new Date(initParamObject.issueDate), "CET", "yyyy-MM-dd") : undefined;

      this.sentDate = ToolsDate.dateDMYtoYMD(initParamObject.sentDate);
      this.sentDate = (initParamObject.sentDate) ? Utilities.formatDate(new Date(initParamObject.sentDate), "CET", "yyyy-MM-dd") : undefined;

      this.daysToPay = initParamObject.daysToPay;
      this.gdId = initParamObject.gdId;
      initParamObject.paymentDeadline = ToolsDate.dateDMYtoYMD(initParamObject.paymentDeadline);
      this.paymentDeadline = (initParamObject.paymentDeadline) ? Utilities.formatDate(new Date(initParamObject.paymentDeadline), "CET", "yyyy-MM-dd") : this.setPaymentDeadline();

      this._lastUpdated = initParamObject._lastUpdated;

      this._entity = initParamObject._entity;
      if (initParamObject._entity)
        this.entityId = initParamObject._entity.id;

      this._editor = initParamObject._editor;
      if (initParamObject._editor)
        this.editorId = initParamObject._editor.id;
      if (initParamObject._owner) {
        this._owner = initParamObject._owner;
        this.ownerId = initParamObject._owner.id;
        this._owner._nameSurnameEmail = this._owner.name + ' ' + this._owner.surname + ' ' + this._owner.email;
      }
      this._contract = initParamObject._contract;
      this.contractId = this._contract.id
      this._items = initParamObject._items;
      
      if (initParamObject.gdId) {
        this._documentOpenUrl = Gd.createDocumentOpenUrl(initParamObject.gdId);
        this.gdId = initParamObject.gdId;
      }
    }
  }

  setPaymentDeadline() {
    if (this.sentDate) {
      var payDay: Date = ToolsDate.addDays(this.sentDate, this.daysToPay);
      return Utilities.formatDate(payDay, "CET", "yyyy-MM-dd");
    }
  }

  /*
     * Używać tylko gdy mamy pojedynczego bloba - pismo przychodzące
     */
  createFile(blobEnviObjects: any[]): GoogleAppsScript.Drive.File {
    var rootFolder = DriveApp.getFolderById(MainSetup.INVOICES_FOLDER_ID);
    var blob = Tools._blobEnviObjectToBlob(blobEnviObjects[0]);
    var invoiceFile = rootFolder.createFile(blob);
    invoiceFile.setShareableByEditors(true);
    //this.addFileToContractFolders(invoiceFile);
    this.gdId = invoiceFile.getId();
    this._documentOpenUrl = Gd.createDocumentOpenUrl(this.gdId);

    return invoiceFile;
  }

  addInDb(conn) {
    addInDb('Invoices', this, conn, true);
    //być może w przyszłości będziemy dodawali w jednym oknie FV i pierwsza pozycję 
    //this.addNewItem(conn);
  }

  private addNewItem(conn) {
    var invoiceItem = new InvoiceItem({
      parentId: this.id,
      _editor: this._editor,
      status: this.status
    });
    try {
      invoiceItem.addInDb(conn);
    } catch (err) {
      Logger.log(JSON.stringify(err));
      throw err;
    }
  }


  editInDb(externalConn, isPartOfTransaction) {
    editInDb('Invoices', this, externalConn, isPartOfTransaction);

  }

  /*
     * pismo przychodzące albo nasze pismo po staremu
     */
  editInGd(blobEnviObjects: Array<any>): GoogleAppsScript.Drive.File {
    //użytkownik chce zmienić plik
    if (blobEnviObjects.length > 0) {
      var file: GoogleAppsScript.Drive.File;
      this.deleteFromGd();
      file = this.createFile(blobEnviObjects);

      this._documentOpenUrl = Gd.createDocumentOpenUrl(this.gdId);
    } else
      file = DriveApp.getFileById(this.gdId);
    return file;
  }

  deleteFromDb() {
    deleteFromDb('Invoices', this);
  }

  deleteFromGd() {
    if (this.gdId) {
      //usuwamy folder lub plik
      if (Gd.canUserDeleteFile(this.gdId)) {
        DriveApp.getFileById(this.gdId).setTrashed(true);
        return true;
      }
      //zmieniamy nazwę pliku ze wzgędu na brak uprawnień do usuwania 
      else {
        var file = DriveApp.getFileById(this.gdId)
        file.setName(file.getName() + '- USUŃ');
        Gd.removeAllFileParents(file);
      }
      return false;
    }
  }

}