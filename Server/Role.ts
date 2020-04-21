class Role {
  id: number;
  projectOurId: string;
  name: string;
  description: string;
  groupName: string;
  managerId: number;
  _group: any;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.projectOurId = initParamObject.projectOurId;
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  PersonRole * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */
function PersonRole(initParamObject) {
  if (initParamObject) {
    this.personId = initParamObject._person.id;
    this.roleId = initParamObject._role.id;
    //id jest usuwane w addInDb(), więc przy asocjacjach musi byś ręcznie odtworeone w controllerze
    this._associationId = '' + this.personId + this.roleId;
    Logger.log('thi is: ' + this._associationId)
    this._person = initParamObject._person;
    this._role = initParamObject._role;
  }
}


PersonRole.prototype = {
  constructor: PersonRole,

  addInDb: function (conn) {
    return addInDb('Persons_Roles', this, conn);
  },

  deleteFromDb: function () {
    deleteFromDb('Persons_Roles', this);
  }
}