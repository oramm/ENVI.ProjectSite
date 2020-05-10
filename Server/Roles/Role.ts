class Role {
  id: number;
  projectOurId: string;
  contractId: number
  name: string;
  description: string;
  groupName: string;
  managerId: number;
  personId: number;
  _person: any;
  _nameSurnameEmail: string;
  _group: any;
  _contract: any;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      if (initParamObject.projectOurId)
        this.projectOurId = initParamObject.projectOurId;
      this._contract = initParamObject._contract;
      if (initParamObject._contract && initParamObject._contract.id)
        this.contractId = initParamObject._contract.id;
      this._person = initParamObject._person;
      this.personId = initParamObject._person.id;
      this._nameSurnameEmail = initParamObject._person._nameSurnameEmail;
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