class Role {
  id: number;
  projectOurId: string;
  contractId: number
  name: string;
  description: string;
  groupName: string;
  managerId: number;
  personId:number;
  _person: any;
  _group: any;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      if (initParamObject.projectOurId)
        this.projectOurId = initParamObject.projectOurId;
      if (initParamObject.contractId)
        this.contractId = initParamObject.contractId;
      this._person = initParamObject._person;
      this.personId = initParamObject._person.id;
      this.name = initParamObject.name;
      this.description = initParamObject.description;
      this.groupName = initParamObject._group.name;
      this._group = initParamObject._group;
      if (initParamObject.managerId)
        this.managerId = initParamObject.managerId;
    }
  }


  addInDb(externalConn?: GoogleAppsScript.JDBC.JdbcConnection, isPartOfTransaction?: boolean) {
    return addInDb('Roles', this, externalConn, isPartOfTransaction);
  }

  editInDb(externalConn?: GoogleAppsScript.JDBC.JdbcConnection, isPartOfTransaction?: boolean) {
    editInDb('Roles', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('Roles', this);
  }
}