class PersonRole {
    personId: any;
    roleId: any;
    _associationId: string;
    _person: any;
    _role: any;
    _contract: any;
    constructor(initParamObject) {
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
  
    addInDb(conn?) {
      return addInDb('Persons_Roles', this, conn);
    }
  
    deleteFromDb() {
      deleteFromDb('Persons_Roles', this);
    }
  }