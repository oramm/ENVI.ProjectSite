function getLettersListPerProject(initParamObject, externalConn?) {
  var projectConditon = (initParamObject && initParamObject.projectId)? 'Projects.OurId="' + initParamObject.projectId + '"' : '1';
  
  var sql = 'SELECT  Letters.Id, \n \t' +
                    'Letters.IsOur, \n \t' +
                    'Letters.Number, \n \t' +
                    'Letters.Description, \n \t' +
                    'Letters.CreationDate, \n \t' +
                    'Letters.RegistrationDate, \n \t' +
                    'Letters.LetterGdId, \n \t' +
                    'Letters.FolderGdId, \n \t' +
                    'Letters.LetterFilesCount, \n \t' +
                    'Letters.LastUpdated, \n \t' +
                    'Projects.Id AS ProjectId, \n \t' +
                    'Projects.OurId AS ProjectOurId, \n \t' +
                    'Projects.GdFolderId AS ProjectGdFolderId, \n \t' + 
                    'Projects.LettersGdFolderId, \n \t' +
                    'Persons.Id AS EditorId, \n \t' +
                    'Persons.Name AS EditorName, \n \t' +
                    'Persons.Surname AS EditorSurname \n' +
            'FROM Letters \n' + 
            //'JOIN Letters_Cases ON Letters_Cases.LetterId=Letters.Id \n' +
            'JOIN Projects ON Letters.ProjectId=Projects.Id \n' +
            'JOIN Persons ON Letters.EditorId=Persons.Id \n' +
            'WHERE ' + projectConditon + '\n' +
            //'GROUP BY Letters.Id \n' +
            'ORDER BY Letters.RegistrationDate, Letters.CreationDate';
  return getLetters(sql, initParamObject, externalConn)
}

function test_getLettersListPerProject(){
  getLettersListPerProject({projectId:'KOB.GWS.01.WLASNE'});
}

function getLetters(sql, initParamObject, externalConn?){
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    if(!conn.isValid(0)) throw new Error ('getLetters:: połączenie przerwane');
    
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    var _casesAssociationsPerProject = getLetterCaseAssociationsPerProjectList(initParamObject,conn);
    var _letterEntitiesPerProject = getLetterEntityAssociationsPerProjectList(initParamObject.projectId,conn);
    
    while (dbResults.next()) {
      var _casesAssociationsPerLetter = _casesAssociationsPerProject.filter(function(item){
        return item.letterId == dbResults.getLong('Id')
      });
      var _letterEntitiesMainPerLetter = _letterEntitiesPerProject.filter(function(item){
        return item.letterId == dbResults.getLong('Id') && item.letterRole == 'MAIN';
      });
      var _letterEntitiesCcPerLetter = _letterEntitiesPerProject.filter(function(item){
        return item.letterId == dbResults.getLong('Id') && item.letterRole == 'Cc';
      });
      
      var item = new Letter({id: dbResults.getLong('Id'),
                             isOur: dbResults.getBoolean('IsOur'),
                             number: dbResults.getString('Number'),
                             description: dbResults.getString('Description'),
                             creationDate: dbResults.getString('CreationDate'),
                             registrationDate: dbResults.getString('RegistrationDate'),
                             letterGdId: dbResults.getString('LetterGdId'),
                             folderGdId: dbResults.getString('FolderGdId'),
                             letterFilesCount:dbResults.getInt('LetterFilesCount'),
                             _lastUpdated: dbResults.getString('LastUpdated'),
                             _project: {id: dbResults.getString('ProjectId'),
                                        ourId: dbResults.getString('ProjectOurId'),
                                        gdFolderId: dbResults.getString('ProjectGdFolderId'),
                                        lettersGdFolderId: dbResults.getString('LettersGdFolderId'),
                                       },
                             _cases: _casesAssociationsPerLetter.map(function(item){
                               return item._case;
                             }),
                             _entitiesMain: _letterEntitiesMainPerLetter.map(function(item){
                               return item._entity;
                             }),
                             _entitiesCc: _letterEntitiesCcPerLetter.map(function(item){
                               return item._entity;
                             }),
                             _editor: {id: dbResults.getInt('EditorId'),
                               name: dbResults.getString('EditorName'),
                                       surname: dbResults.getString('EditorSurname'),
                                      }
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

function test_editLetter(){
  editLetter('')
}

function test_addNewLetter(){
  addNewLetter('')
}

function addNewLetter(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  if(!itemFormClient._blobEnviObjects) 
    itemFormClient._blobEnviObjects = [];
  var item = new Letter(itemFormClient);
  
  try{
    if(item.isOur && item._template)
      var letterFolder = item.createOurLetter(itemFormClient._blobEnviObjects);
    //pismo przychodzące albo nasze pismo ale po staremu
    else {
      if(itemFormClient._blobEnviObjects.length>1)
        var letterFolder = item.createLetterFolder(itemFormClient._blobEnviObjects);
      else
        var letterFile = item.createLetterFile(itemFormClient._blobEnviObjects);
    }
    var conn = connectToSql();
    conn.setAutoCommit(false);
    item.addInDb(conn);
    conn.commit();
    if(item.letterFilesCount>1 || item.isOur && item._template)
      letterFolder.setName(item.makeFolderName());
    Logger.log(' item Added ItemId: ' + item.id);
    
    return item;
  } catch (err) {
    if(conn && conn.isValid(0)) conn.rollback();
    item.deleteFromGd();
    Logger.log(JSON.stringify(err));
    throw err;
  } finally {
    if(conn && conn.isValid(0)) conn.close();
  } 
}

function editLetter(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var conn;
  try{
    var item = new Letter(itemFormClient);
    //nasze pismo po nowemu
    if(item.isOur && item._template){
      item.editOurFolder(itemFormClient._blobEnviObjects);
    //pismo przychodzące albo nasze pismo po staremu
    } else
    if(itemFormClient._blobEnviObjects.length>0){
      //użytkownik chce zmienić plik
      item.editFileOrFolder(itemFormClient._blobEnviObjects);
    }
    
    conn = connectToSql();
    item.editInDb(conn, true);
    conn.commit();
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(conn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn && conn.isValid(0)) conn.close();
  }
}

function deleteLetter(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new Letter(itemFormClient);
    item.deleteFromDb();
    var success = item.deleteFromGd();
    return {success: success,
            message: (success)? undefined : 'Usunięto dane pisma z bazy, ale musisz ręcznie usunąć pliki z Drive. \n Dla ułatwienia do nazwy dodano dopisek "- USUŃ"',
            externalUrl: (success)? undefined : Gd.createGdFolderUrl(item._project.lettersGdFolderId)
           }
  } catch(err){
    Logger.log(err)
    throw err;
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  Letters_Cases * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */

function test_getLetterCaseAssociationsPerProjectList(){
  getLetterCaseAssociationsPerProjectList({projectId: 'kob.gws.01.wlasne'});
}
function getLetterCaseAssociationsPerProjectList(initParamObject,externalConn?){
  var projectConditon = (initParamObject && initParamObject.projectId)? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';
  
  var sql = 'SELECT  Letters_Cases.LetterId, \n \t' +
                    'Letters_Cases.CaseId, \n \t' +
                    'Letters.Number, \n \t' +
                    'Letters.Description, \n \t' +
                    'Letters.CreationDate, \n \t' +
                    'Letters.RegistrationDate, \n \t' +
                    'Letters.LetterGdId, \n \t' +
                    'Letters.FolderGdId, \n \t' +
                    'Letters.LastUpdated, \n \t' +
                    'Cases.Name AS CaseName, \n \t' +
                    'Cases.Number AS CaseNumber, \n \t' +
                    'Cases.Description AS CaseDescription, \n \t' +
                    'Cases.GdFolderId AS CaseGdFolderId, \n \t' +
                    'CaseTypes.Id AS CaseTypeId, \n \t' +
                    'CaseTypes.Name AS CaseTypeName, \n \t' +
                    'CaseTypes.IsDefault, \n \t' +
                    'CaseTypes.IsUniquePerMilestone, \n \t' +
                    'CaseTypes.MilestoneTypeId, \n \t' +
                    'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
                    'Milestones.Id AS MilestoneId, \n \t' +
                    'Milestones.Name AS MilestoneName, \n \t' +
                    'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
                    'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
                    'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
                    'OurContractsData.OurId AS ContractOurId, \n \t' +
                    'Contracts.Number AS ContractNumber \n' +
                'FROM Letters_Cases \n' +
                'JOIN Letters ON Letters_Cases.LetterId = Letters.Id \n' +
                'JOIN Cases ON Letters_Cases.CaseId = Cases.Id \n' +
                'JOIN CaseTypes ON Cases.TypeId = CaseTypes.Id \n' +
                'JOIN Milestones ON Cases.MilestoneId=Milestones.Id \n' +
                'JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
                'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
                'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
                'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n' +
                'WHERE ' + projectConditon + ' \n'+
                'ORDER BY Letters_Cases.LetterId, Cases.Name';

  return getLetterCaseAssociations(sql,externalConn); 
}

function getLetterCaseAssociations(sql,externalConn){
  Logger.log(sql);
  try{
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    var stmt = conn.createStatement();

    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      var item = new LetterCase({_letter: {id: dbResults.getLong('LetterId'),
                                           number: dbResults.getString('Number'),
                                           description: dbResults.getString('Description'),
                                           creationDate: dbResults.getString('CreationDate'),
                                           registrationDate: dbResults.getString('RegistrationDate'),
                                           letterGdId: dbResults.getString('LetterGdId'),
                                           folderGdId: dbResults.getString('FolderGdId')
                                          },
                                 _case: new Case({id: dbResults.getLong('CaseId'),
                                                  name: dbResults.getString('CaseName'),
                                                  number: dbResults.getString('CaseNumber'),
                                                  description: dbResults.getString('CaseDescription'),
                                                  gdFolderId: dbResults.getString('CaseGdFolderId'),
                                                  _type:{id: dbResults.getInt('CaseTypeId'),
                                                         name: dbResults.getString('CaseTypeName'),
                                                         isDefault: dbResults.getBoolean('IsDefault'),
                                                         isUniquePerMilestone: dbResults.getBoolean('isUniquePerMilestone'),
                                                         milestoneTypeId: dbResults.getInt('MilestoneTypeId'),
                                                         folderNumber: dbResults.getString('CaseTypeFolderNumber'),
                                                        },
                                                  _parent: {id: dbResults.getLong('MilestoneId'),
                                                            _type:{id: dbResults.getLong('MilestoneTypeId'),
                                                                   name: dbResults.getString('MilestoneTypeName'),
                                                                   _folderNumber: dbResults.getString('MilestoneTypeFolderNumber'),
                                                                  },
                                                            _parent: {ourId: dbResults.getString('ContractOurId'),
                                                                      number: dbResults.getString('ContractNumber')
                                                                     }
                                                           },
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

function addNewLetterCaseAssociation(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  var item = new LetterCase(itemFormClient);
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

function test_addNewLetterCaseAssociationInDb(){
  addNewLetterCaseAssociation(
    ''
    );

}

function deleteLetterCaseAssociation(item){
  var item = JSON.parse(item);
  var conn = connectToSql();
  try {
    var stmt = conn.createStatement();
    stmt.executeUpdate('DELETE FROM Letters_Cases WHERE ' +
                      'LetterId =' + prepareValueToSql(item._letter.id) +' AND CaseId =' + prepareValueToSql(item._case.id));
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * *  Letters_Entities * * * * * * * * * * * * * * * * * * * * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */
function test_getLetterEntityAssociationsPerProjectList(){
  getLetterEntityAssociationsPerProjectList('kob.gws.01.wlasne');
}
function getLetterEntityAssociationsList(initParamObject,externalConn){
  var projectConditon = (initParamObject && initParamObject.projectId)? 'Projects.OurId="' + initParamObject.projectId + '"' : '1';
  
  var sql = 'SELECT  Letters_Entities.LetterId, \n \t' +
                    'Letters_Entities.EntityId, \n \t' +
                    'Letters_Entities.LetterRole, \n \t' +
                    'Entities.Name AS EntityName, \n \t' +
                    'Entities.Address AS EntityAddress, \n \t' +
                    'Entities.TaxNumber AS EntityTaxNumber, \n \t' +
                    'Entities.Www AS EntityWww, \n \t' +
                    'Entities.Email AS EntityEmail, \n \t' +
                    'Entities.Phone AS EntityPhone, \n \t' +
                    'Entities.Fax AS EntityFax \n' +
                'FROM Letters_Entities \n' +
                'JOIN Letters ON Letters_Entities.LetterId = Letters.Id \n' +
                'JOIN Projects ON Letters.ProjectId = Projects.Id \n' +
                'JOIN Entities ON Letters_Entities.EntityId=Entities.Id \n' +
                'WHERE ' + projectConditon + ' \n'+
                'ORDER BY Letters_Entities.LetterRole, EntityName';

  return getLetterEntityAssociations(sql,externalConn); 
}
function getLetterEntityAssociationsPerProjectList(projectId,externalConn?){
  return getLetterEntityAssociationsList({projectId: projectId},externalConn)
}

function getLetterEntityAssociations(sql,externalConn){
  Logger.log(sql);
  try{
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    var stmt = conn.createStatement();

    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      var item = new LetterEntity({letterRole: dbResults.getString('LetterRole'),
                                    _letter: {id: dbResults.getLong('LetterId')
                                              },
                                    _entity: new Entity({id: dbResults.getLong('EntityId'),
                                                         name: dbResults.getString('EntityName'),
                                                         address: dbResults.getString('EntityAddress'),
                                                         taxNumber: dbResults.getString('EntityTaxNumber'),
                                                         www: dbResults.getString('EntityWww'),
                                                         email: dbResults.getString('EntityEmail'),
                                                         phone: dbResults.getString('EntityPhone'),
                                                         fax:dbResults.getString('EntityFax')
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

function addNewLetterEntityAssociation(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  var item = new LetterEntity(itemFormClient);
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

function deleteLetterEntityAssociation(item){
  var item = JSON.parse(item);
  var conn = connectToSql();
  try {
    var stmt = conn.createStatement();
    stmt.executeUpdate('DELETE FROM Letters_Entities WHERE ' +
                      'LetterId =' + prepareValueToSql(item._letter.id) +' AND EntityId =' + prepareValueToSql(item._entity.id));
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    conn.close();
  }
}
