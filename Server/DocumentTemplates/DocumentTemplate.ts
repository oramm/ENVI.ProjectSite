class DocumentTemplate implements Envi.DocumentTemplate {
  id: any;
  name: string;
  description?: string;
  gdId: string;
  _contents: Envi.DocumentContents;
  _nameConentsAlias: string;

  constructor(initParamObject: Envi.DocumentTemplate) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.name = initParamObject.name;
      this.description = initParamObject.description;
      this.gdId = initParamObject.gdId;
      this._contents = initParamObject._contents;
      this._nameConentsAlias = (initParamObject._contents.alias) ? initParamObject._contents.alias : initParamObject.name;
    }
  }

  addInDb(conn: GoogleAppsScript.JDBC.JdbcConnection, isPartOfTransaction?: boolean) {
    return addInDb('DocumentTemplates', this, conn, isPartOfTransaction);
  }

  editInDb(externalConn: GoogleAppsScript.JDBC.JdbcConnection, isPartOfTransaction?: boolean) {
    editInDb('DocumentTemplates', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('DocumentTemplates', this);
  }
}