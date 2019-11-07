function getProjectsList(projectId) {
  try {
    if (!projectId) projectId = '%'
    var conn = connectToSql();
    var stmt = conn.createStatement();
    var currentUser = new Person({systemEmail: Session.getEffectiveUser().getEmail()});
    
    //var currentUser = new Person({systemEmail: '1monika.tymczyszyn28@gmail.com'});
    
    var currentUserSystemRole = currentUser.getSystemRole(conn);
    var result = [];
    
    Logger.log(JSON.stringify(currentUserSystemRole))
    var query;
    if (currentUserSystemRole.name == 'ENVI_EMPLOYEE' || currentUserSystemRole.name == 'ENVI_MANAGER')
      query = 'SELECT * FROM Projects WHERE Id LIKE "' + projectId + '";';
    else if(currentUserSystemRole)
      query = 'SELECT  Projects.Id, \n \t' +
                      'Projects.OurId, \n \t' +
                      'Projects.Name,  \n \t ' +
                      'Projects.Alias,  \n \t' +
                      'Projects.StartDate,  \n \t'+
                      'Projects.EndDate,  \n \t'+
                      'Projects.Status,  \n \t'+
                      'Projects.Comment,  \n \t'+
                      'Projects.FinancialComment,  \n \t'+
                      'Projects.InvestorId,  \n \t'+
                      'Projects.TotalValue,  \n \t'+
                      'Projects.QualifiedValue,  \n \t'+
                      'Projects.DotationValue,  \n \t'+
                      'Projects.GdFolderId,  \n \t'+
                      'Projects.LettersGdFolderId,  \n \t'+
                      'Projects.GoogleGroupId,  \n \t'+
                      'Projects.GoogleCalendarId,  \n \t'+
                      'Projects.LastUpdated \n'+
              'FROM Projects \n' + 
              'JOIN Roles ON Roles.ProjectId = Projects.OurId \n' +
              'JOIN Persons_Roles ON Persons_Roles.RoleID = Roles.Id \n' + 
              'WHERE Persons_Roles.PersonID = @x := (SELECT Persons.Id FROM Persons WHERE Persons.SystemEmail = "' + currentUser.systemEmail + '") \n' +
              'GROUP BY Projects.Id';
                   
    Logger.log(query);              
    var dbResults = stmt.executeQuery(query);              
    
    while (dbResults.next()) {
      var entitiesPerProject = getProjectEntityAssociationsPerProjectList(dbResults.getString('OurId'), conn);
      var engineers = entitiesPerProject.filter(function(item){
        return item.projectRole == 'ENGINEER';
      });
      var employers = entitiesPerProject.filter(function(item){
        return item.projectRole == 'EMPLOYER';
      });
      if(dbResults.getString('OurId')=='KOB.GWS.01.WLASNE')
        Logger.log(this.ourId)
      var item = new Project({id:dbResults.getLong('Id'),
                              ourId:  dbResults.getString('OurId'),
                              name: dbResults.getString('Name'),
                              alias: dbResults.getString('Alias'),
                              startDate: dbResults.getString('StartDate'),
                              endDate: dbResults.getString('EndDate'),
                              status: dbResults.getString('Status'),
                              comment: dbResults.getString('Comment'),
                              financialComment: dbResults.getString('FinancialComment'),
                              investorId: dbResults.getLong('InvestorId'),
                              totalValue: dbResults.getString('TotalValue'),
                              qualifiedValue: dbResults.getString('QualifiedValue'),
                              dotationValue: dbResults.getString('DotationValue'),
                              gdFolderId: dbResults.getString('GdFolderId'),
                              lettersGdFolderId: dbResults.getString('LettersGdFolderId'),
                              googleGroupId: dbResults.getString('GoogleGroupId'),
                              googleCalendarId: dbResults.getString('GoogleCalendarId'),
                              _engineers: engineers.map(function(item){
                                return item._entity;
                              }),
                              _employers: employers.map(function(item){
                                return item._entity;
                              }),
                              lastUpdated: dbResults.getString('LastUpdated')
                             });
      result.push(item);
    }
    
    dbResults.close();
    stmt.close();
    return result;
    
  } catch (e) {
    Logger.log(JSON.stringify(e));
    throw e;
  } finally {
    conn.close();
  }
}

function addNewProject(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var item = new Project(itemFromClient);
  item.addInDb();
  Logger.log(' item Added ItemId: ' + item.id);
  return item;
}

function editProject(itemFromClient) {
  itemFromClient = JSON.parse(itemFromClient);
  var conn;
  try{
    var item = new Project(itemFromClient);
    conn = connectToSql();
    item.editInDb(conn);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(conn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn && conn.isValid(0)) conn.close();
  }
}

function test_editProject(){
  editProject('')
}

//utwórz foldery dla projektów
function makeGdFoldersForProjects(){
  var projects = getProjectsList(undefined);
  for (var i = 0; i <projects.length; i++) {
    var gd = new Gd(new Contract({projectId: projects[i].id},undefined))
    projects[i].gdFolderId = gd.projectFolder.getId();
    var t = JSON.stringify(projects[i]);
    editProject(JSON.stringify(projects[i]));
    
  }
}

function addProjectCalendar(itemFromClient){
  itemFromClient = JSON.parse(itemFromClient);
  //itemFromClient.projectId = 'KOB.GWS.01.WLASNE';
  var project = new Project({id: itemFromClient.projectId})
  
  project.addCalendar(itemFromClient.projectId);
  return project;
}

function test_addProjectCalendar(){
  addProjectCalendar('{id: "KOB.GWS.01.WLASNE"}');
}
//tworzy foldery korespodncji w projektach
function setLettersFoldersinAllProjects() {
  try{
    //var conn = connectToSql();
    //conn.setAutoCommit(false);
    var projectsList = getProjectsList(undefined);
    for (var i=0; i<projectsList.length; i++){
      //var folder = gd.setFolder(DriveApp.getFolderById(projectsList[i].gdFolderId), 'Korespondencja');
      var meetingProtocolsGdFolder = Gd.setFolder(DriveApp.getFolderById(projectsList[i].gdFolderId), 'Notatki ze spotkań');
      if (meetingProtocolsGdFolder) meetingProtocolsGdFolder.setTrashed(true);
      Logger.log('ProjectId: ' + projectsList[i].ourId);
      //projectsList[i].lettersGdFolderId = folder.getId();
      //projectsList[i].editInDb(conn, true);
      
     // conn.commit();
    }
  } catch (err) {
    //if(conn && conn.isValid(0)) conn.rollback();
    Logger.log(JSON.stringify(err));
    throw err;
  } finally {
    //if(conn && conn.isValid(0)) conn.close();
  } 
}


//napraw foldery projektów
function setfoldersAllProjects() {
  var projectsList = getProjectsList(undefined);
  
  var rootfolder = DriveApp.getFolderById('1C_wMgQJtzsFmgsmHp7Dr_F1VJx4v1mjo');
  
  for (var i=0; i<projectsList.length; i++){
    var gd = new Gd(undefined);
    var folder = rootfolder.getFoldersByName(projectsList[i].ourId).next();
    projectsList[i].gdFolderId = folder.getId();
    Logger.log('FolderName: ' + folder.getName() + ' :: ProjectId: ' + projectsList[i].ourId);
    projectsList[i].editInDb();
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  Projects_Entities * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */

function test_getProjectEntityAssociationsPerProjectList(){
  getProjectEntityAssociationsPerProjectList('kob.gws.01.wlasne',undefined);
}
function getProjectEntityAssociationsList(initParamObject,externalConn){
  var projectConditon = (initParamObject && initParamObject.projectId)? 'Projects.OurId="' + initParamObject.projectId + '"' : '1';
  
  var sql = 'SELECT  Projects_Entities.ProjectId, \n \t' +
                    'Projects_Entities.EntityId, \n \t' +
                    'Projects_Entities.ProjectRole, \n \t' +
                    'Entities.Name, \n \t' +
                    'Entities.Address, \n \t' +
                    'Entities.TaxNumber, \n \t' +
                    'Entities.Www, \n \t' +
                    'Entities.Email, \n \t' +
                    'Entities.Phone, \n \t' +
                    'Entities.Fax \n' +
                'FROM Projects_Entities \n' +
                'JOIN Projects ON Projects_Entities.ProjectId = Projects.Id \n' +
                'JOIN Entities ON Projects_Entities.EntityId=Entities.Id \n' +
                'WHERE ' + projectConditon + ' \n'+
                'ORDER BY Projects_Entities.ProjectRole, Entities.Name';

  return getProjectEntityAssociations(sql,externalConn); 
}
function getProjectEntityAssociationsPerProjectList(projectId,externalConn){
  return getProjectEntityAssociationsList({projectId: projectId},externalConn)
}

function getProjectEntityAssociations(sql,externalConn){
  Logger.log(sql);
  try{
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    var stmt = conn.createStatement();

    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      var item = new ProjectEntity({projectRole: dbResults.getString('ProjectRole'),
                                    _project: {id: dbResults.getLong('ProjectId')
                                              },
                                    _entity: new Entity({id: dbResults.getLong('EntityId'),
                                                         name: dbResults.getString('Name'),
                                                         address: dbResults.getString('Address'),
                                                         taxNumber: dbResults.getString('TaxNumber'),
                                                         www: dbResults.getString('Www'),
                                                         email: dbResults.getString('Email'),
                                                         phone: dbResults.getString('Phone'),
                                                         fax:dbResults.getString('Fax')
                                                        })
                                   });
      result.push(item);
    }
    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if(!externalConn && conn.isValid(0)) conn.close();
  }
}



function addNewProjectEntityAssociation(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  var item = new ProjectEntity(itemFormClient);
  try{
      var conn = connectToSql();
      conn.setAutoCommit(false);
      item.addInDb(conn);
      conn.commit();
      
      Logger.log(' association added ItemId: ' + item._associationId);
      
      return item;
    } catch (err) {
      if(conn.isValid(0)) conn.rollback();
      Logger.log(JSON.stringify(err));
      throw err;
    } finally {
      if(conn.isValid(0)) conn.close();
    } 
}


function deleteProjectEntityAssociation(item){
  var item = JSON.parse(item);
  var conn = connectToSql();
  try {
    var stmt = conn.createStatement();
    stmt.executeUpdate('DELETE FROM Projects_Entities WHERE ' +
                      'ProjectId =' + prepareValueToSql(item._project.id) +' AND EntityId =' + prepareValueToSql(item._entity.id));
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}