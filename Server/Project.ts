function Project(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.ourId = initParamObject.ourId;
    if (initParamObject.name) this.name = initParamObject.name;
    this.alias = initParamObject.alias;
    if (initParamObject.startDate){ 
      initParamObject.startDate = dateDMYtoYMD(initParamObject.startDate);
      this.startDate = Utilities.formatDate(new Date(initParamObject.startDate), "CET", "yyyy-MM-dd");
    }
    if (initParamObject.endDate){ 
      initParamObject.endDate = dateDMYtoYMD(initParamObject.endDate);
      this.endDate = Utilities.formatDate(new Date(initParamObject.endDate), "CET", "yyyy-MM-dd");
    }
    if (initParamObject.status) this.status = initParamObject.status;
    if (initParamObject.comment) this.comment = initParamObject.comment;
    if (initParamObject.financialComment) this.financialComment = initParamObject.financialComment;
    if (initParamObject.investorId) this.investorId = initParamObject.investorId;
    if (initParamObject.totalValue) this.totalValue = initParamObject.totalValue;
    if (initParamObject.qualifiedValue) this.qualifiedValue = initParamObject.qualifiedValue;
    if (initParamObject.dotationValue) this.dotationValue = initParamObject.dotationValue;
    
    if (initParamObject.gdFolderId) {
      this.gdFolderId = initParamObject.gdFolderId;
      this._gdFolderUrl = 'https://drive.google.com/drive/folders/' + initParamObject.gdFolderId;
    }
    this.lettersGdFolderId = initParamObject.lettersGdFolderId;
    
    if (initParamObject.googleGroupId){ 
      this.googleGroupId = initParamObject.googleGroupId;
      this._googleGroupUrl = 'https://groups.google.com/forum/?hl=pl#!forum/' + this.googleGroupId.replace(/\./gi, '');
    }
    if (initParamObject.googleCalendarId){ 
      this.googleCalendarId = initParamObject.googleCalendarId;
      this._googleCalendarUrl =  this.makeCalendarUrl();
    }
    this._ourId_Alias = this.ourId
    if(this.alias) 
      this._ourId_Alias += ' ' + this.alias;
    this._lastUpdated = initParamObject._lastUpdated;
    var defaultEngineer = {id: 1,
                           name: 'ENVI',
                           address: 'ul. Jana Brzechwy 3, 49-305 Brzeg',
                           taxNumber: '747-156-40-59',
                          };
    this._engineers = (initParamObject._engineers && initParamObject._engineers[0])? initParamObject._engineers : [defaultEngineer];
    this._employers = (initParamObject._employers)? initParamObject._employers : [];
  }
}


Project.prototype = {
  constructor: Project,
  addCalendar: function(name){
    if (!this.googleCalendarId){
      var existingCalendar = CalendarApp.getCalendarsByName(name)[0];
      var calendar;
      calendar = (existingCalendar)?  existingCalendar : CalendarApp.createCalendar(name);
      this.googleCalendarId = calendar.getId();
      this.editInDb();
      this.googleCalendarUrl = this.makeCalendarUrl();
    }
  },
  
  makeCalendarUrl: function(){
    return 'https://calendar.google.com/calendar/embed?src=' + this.googleCalendarId + '&ctz=Europe%2FWarsaw';
  },
  
  addInDb: function(conn, isPartOfTransaction) {
    addInDb('Projects', this, conn, isPartOfTransaction);
    this.addEntitiesAssociationsInDb(conn);
  },
  
  addEntitiesAssociationsInDb: function(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    this._engineers = this._engineers.map(function(item){item.projectRole = 'ENGINEER'; 
                                                             return item 
                                                            });
    this._employers = this._employers.map(function(item){item.projectRole = 'EMPLOYER'; 
                                                             return item 
                                                            });
    var entities = this._employers.concat(this._engineers); 
    try {
      for(var i=0; i<entities.length; i++){
        var entityAssociation = new ProjectEntity({projectRole: entities[i].projectRole,
                                                   _project: this,
                                                   _entity: entities[i]
                                                  });
        entityAssociation.addInDb(externalConn);
      }
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  },
  
  editInDb: function(externalConn) {
    var conn = (externalConn)? externalConn : connectToSql();
    this.deleteEntitiesAssociationsFromDb(conn);
    editInDb('Projects', this, conn, undefined);
    this.addEntitiesAssociationsInDb(conn, true);
  },
  
  deleteEntitiesAssociationsFromDb: function(externalConn){
    var conn = (externalConn)? externalConn : connectToSql();
    try {
      var stmt = conn.createStatement();
      stmt.executeUpdate('DELETE FROM Projects_Entities WHERE ' +
                         'ProjectId =' + prepareValueToSql(this.id));
    } catch (e) {
      Logger.log(e);
      throw e;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  Projects_Entities * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */
function ProjectEntity(initParamObject) {
  if(initParamObject){
    this.projectId = initParamObject._project.id;
    this._project = initParamObject._project;

    this.entityId = initParamObject._entity.id;
    this._entity = initParamObject._entity;

    this.projectRole = initParamObject.projectRole;
    //id jest usuwane w addInDb(), więc przy asocjacjach musi byś ręcznie odtworeone w controllerze
    this.id = '' + this.projectId + this.entityId;
    Logger.log('this is: ' + this.id);
  }
}


ProjectEntity.prototype = {
  constructor: ProjectEntity,
  
  addInDb: function(externalConn, isPartOfTransaction) {
    var conn = (externalConn)? externalConn : connectToSql();
    addInDb('Projects_Entities', this, externalConn, isPartOfTransaction);
  }
}