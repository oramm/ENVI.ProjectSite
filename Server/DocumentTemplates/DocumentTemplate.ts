class DocumentTemplate implements Envi.DocumentTemplate {
  id: any;
  name?: string;
  description?: string;
  caseTypeId: any;
  gdId: string;
  contents: string;

  constructor(initParamObject: Envi.DocumentTemplate) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.name = initParamObject.name;
      this.description = initParamObject.description;
      this.caseTypeId = initParamObject.caseTypeId;
      this.gdId = initParamObject.gdId;
      this.contents = initParamObject.contents
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