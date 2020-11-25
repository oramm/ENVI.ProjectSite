class ExternalAchievement {
  id?: number;
  roleName: string;
  description: string;
  worksScope: string;
  worksValue: any;
  projectValue: any;
  startDate: string;
  endDate: string;
  employer: any;
  ownerId: number;
  _owner: any;

  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.roleName = initParamObject.roleName;
      this.description = initParamObject.description;
      this.worksScope = initParamObject.worksScope;
      this.worksValue = initParamObject.worksValue;
      this.projectValue = initParamObject.projectValue;

      initParamObject.startDate = ToolsDate.dateDMYtoYMD(initParamObject.startDate);
      this.startDate = Utilities.formatDate(new Date(initParamObject.startDate), "CET", "yyyy-MM-dd");

      initParamObject.endDate = ToolsDate.dateDMYtoYMD(initParamObject.endDate);
      this.endDate = Utilities.formatDate(new Date(initParamObject.endDate), "CET", "yyyy-MM-dd");
      this.employer = initParamObject.employer;
      this.ownerId = initParamObject._owner.id;
      this._owner = initParamObject._owner;
    }
  }


  addInDb(conn?, isPartOfTransaction?) {
    return addInDb('AchievementsExternal', this, conn, isPartOfTransaction);
  }

  editInDb(externalConn?, isPartOfTransaction?) {
    editInDb('AchievementsExternal', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('AchievementsExternal', this);
  }

}