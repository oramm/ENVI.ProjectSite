class Person {
  id: number;
  entityId: number;
  name: string;
  surname: string;
  position: string;
  email: string;
  cellphone: string;
  phone: string;
  comment: string;
  systemRoleId: Number;
  systemEmail: string;
  _entity: any;
  _nameSurnameEmail: string;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      if (initParamObject._entity) this.entityId = initParamObject._entity.id;
      this.name = initParamObject.name;
      this.surname = initParamObject.surname;
      this.position = initParamObject.position;
      this.email = initParamObject.email;
      this.cellphone = initParamObject.cellphone;
      this.phone = initParamObject.phone;
      this.comment = initParamObject.comment;
      this.systemRoleId = initParamObject.systemRoleId;
      this.systemEmail = initParamObject.systemEmail;
      this._entity = initParamObject._entity;
      this._nameSurnameEmail = this.name + ' ' + this.surname + ' ' + this.email;
    }
  }
  static getPerson(initParamObject: { systemRoleName?: string, systemEmail?: string, id?: number }, externalConn?): Person {
    return getPersonsList(initParamObject, externalConn)[0];
  }

  getSystemRole(externalConn?) {
    var conn = (externalConn) ? externalConn : connectToSql();
    try {
      var personIdCondition = (this.id) ? 'Persons.Id=' + this.id : '1';
      var systemEmailCondition = (this.systemEmail) ? 'Persons.SystemEmail = "' + this.systemEmail + '"' : '1';
      var sql = 'SELECT \n \t' +
        'Persons.SystemRoleId, \n \t ' +
        'Persons.Id AS PersonId, \n \t ' +
        'SystemRoles.Name AS SystemRoleName \n' +
        'FROM Persons \n ' +
        'JOIN SystemRoles ON Persons.SystemRoleId=SystemRoles.Id \n' +
        'WHERE ' + systemEmailCondition + ' AND ' + personIdCondition;
      Logger.log(sql);

      var stmt = conn.createStatement();
      var results = stmt.executeQuery(sql);
      results.last();
      return {
        personId: results.getInt('PersonId'),
        systemRoleId: results.getInt('SystemRoleId'),
        name: results.getString('SystemRoleName')
      };
    } catch (e) {
      Logger.log(e);
      throw new Error("Użytkownik nie ma uprawnień!");
    } finally {
      if (!externalConn && conn && conn.isValid(0)) conn.close();
    }
  }

  addInDb(conn?, isPartOfTransaction?) {
    return addInDb('Persons', this, conn, isPartOfTransaction);
  }

  editInDb(externalConn?, isPartOfTransaction?) {
    editInDb('Persons', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('Persons', this);
  }

}