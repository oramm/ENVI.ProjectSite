function Role(initParamObject) {
  if (initParamObject) {
    this.id = initParamObject.id;
    this.projectId = initParamObject.projectId;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
  }
}


Role.prototype = {
  constructor: Role,

  addInDb: function (conn, isPartOfTransaction) {
    return addInDb('Roles', this, conn, isPartOfTransaction);
  },

  editInDb: function (externalConn, isPartOfTransaction) {
    editInDb('Roles', this, externalConn, isPartOfTransaction);
  },

  deleteFromDb: function () {
    deleteFromDb('Roles', this);
  },
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