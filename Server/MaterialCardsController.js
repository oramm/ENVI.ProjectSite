function getMaterialCardsListPerContract(contractId) {
  var sql = 'SELECT MaterialCards.Id, \n \t' +
                   'MaterialCards.Status, \n \t' +
                   'MaterialCards.Name, \n \t' +
                   'MaterialCards.Description, \n \t' +
                   'MaterialCards.CreationDate, \n \t' +
                   'MaterialCards.Deadline, \n \t' +
                   'MaterialCards.LastUpdated, \n \t' +
                   'MaterialCards.GdFolderId, \n \t' +
                   'Cases.Id AS CaseId, \n \t' +
                   'Cases.Number AS CaseNumber, \n \t' +
                   'Cases.Name AS CaseName, \n \t' +
                   'Cases.Description AS CaseDescription, \n \t' +
                   'Cases.GdFolderId AS CaseGdFolderId, \n \t' +
                   'CaseTypes.Id AS CaseTypeId, \n \t' +
                   'CaseTypes.Name AS CaseTypeName, \n \t' +
                   'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
                   'Editors.Id AS EditorId, \n \t' +
                   'Editors.Name AS EditorName, \n \t' +
                   'Editors.Surname AS EditorSurname, \n \t' +
                   'Editors.Email AS EditorEmail, \n \t' +
                   'Owners.Id AS OwnerId, \n \t' +
                   'Owners.Name AS OwnerName, \n \t' +
                   'Owners.Surname AS OwnerSurname, \n \t' +
                   'Owners.Email AS OwnerEmail \n' +
               'FROM MaterialCards \n' +
               'JOIN Cases ON MaterialCards.caseId=Cases.Id \n' +
               'JOIN CaseTypes ON CaseTypes.Id=Cases.TypeId \n' +
               'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
               'JOIN Contracts ON Contracts.Id=Milestones.ContractId \n' +
               'JOIN Persons AS Editors ON Editors.Id=MaterialCards.EditorId \n' +
               'JOIN Persons AS Owners ON Owners.Id=MaterialCards.OwnerId \n' +
               'WHERE Milestones.ContractId=' + contractId + '\n' +
               'ORDER BY MaterialCards.Id DESC';
  Logger.log(sql);
  return getMaterialCards(sql);
}
function test_getMaterialCardsListPerContract(){
  getMaterialCardsListPerContract("361")
}

function getMaterialCards(sql) {
  var result = [];
  var conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      var item = new MaterialCard ({id: dbResults.getLong('Id'),
                                    name: dbResults.getString('Name'),
                                    description: dbResults.getString('Description'),                                    
                                    status:dbResults.getString('Status'),
                                    creationDate: dbResults.getString('CreationDate'),
                                    deadline: dbResults.getString('Deadline'),
                                    gdFolderId: dbResults.getString('GdFolderId'),
                                    lastUpdated: dbResults.getString('LastUpdated'),
                                    _case: {id: dbResults.getLong('CaseId'),
                                            number: dbResults.getInt('CaseNumber'),
                                            gdFolderId: dbResults.getString('CaseGdFolderId'),
                                            _type: {id: dbResults.getLong('CaseTypeId'),
                                                    name: dbResults.getString('CaseTypeName'),
                                                    folderNumber: dbResults.getString('CaseTypeFolderNumber')
                                                   }
                                           },
                                    //ostatni edytujący
                                    _editor: {id: dbResults.getLong('EditorId'),
                                              name: dbResults.getString('EditorName'),
                                              surname: dbResults.getString('EditorSurname'),
                                              email: dbResults.getString('EditorEmail')
                                             },
                                    //odpowiedzialny za kolejną akcję
                                    _owner: {id: dbResults.getLong('OwnerId'),
                                             name: dbResults.getString('OwnerName'),
                                             surname: dbResults.getString('OwnerSurname'),
                                             email: dbResults.getString('OwnerEmail')
                                            }
                                   });
      item._owner.nameSurnameEmail = item._owner.name + ' ' + item._owner.surname + ' ' + item._owner.email;
      //item._contractNumber_Number_Name = item._parent._parent.number + ' | ' + item._number + ' ' + item._name;
      //item._contractNumber_typeFolderNumber_TypeName_Number_Name = dbResults.getString(17) + ' | ' + 
      //                                                             item._case._type.folderNumber + ' ' + item._case._type.name + ' | ' + 
      //                                                             item._case._displayNumber + ' ' + item._name;
      
      result.push(item);
    }
    dbResults.close();
    stmt.close();
    return result;
  } catch (e) {
    throw e;
  } finally {
    conn.close();
  }  
}

//tworzy nowy wniosek i folder dla tego wniosku w folderze 07.01
function addNewMaterialCard(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  
  try{
    var conn = connectToSql();
    conn.setAutoCommit(false);
    itemFormClient.externalConn = conn;
    var item = new MaterialCard(itemFormClient);
    
    var gdFolder = item.createGdFolder();
    item.gdFolderId = gdFolder.getId();
    item._gdFolderUrl = Gd.createGdFolderUrl(item.gdFolderId);
    
    item.addInDb(conn, true);
    var tasks = item.createDefaultTasksInDb(conn);
    conn.commit();
    item.editGdFolderName();
    item.createDefaultTasksInScrum(tasks);    
    
    Logger.log(' item Added ItemId: ' + item.id);
    
    return item;
  } catch (err) {
    if (conn && conn.isValid(0)) conn.rollback();
    if(gdFolder) gdFolder.setTrashed(true);
    if(item) item.deleteFromScrum([]);
    Logger.log(JSON.stringify(err));
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  } 
}

function test_addMaterialCard(){
  addNewMaterialCard('');
}

function editMaterialCard(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new MaterialCard(itemFormClient);
    item.editGdFolderName();

    var conn = connectToSql();
    conn.setAutoCommit(false);
    try{
      item.editInDb(conn, true);
      conn.commit();
      Logger.log('item edited ItemId: ' + item.id);
      return item;
    } catch (err) {
      conn.rollback();
      throw err;
    } finally {
      conn.close();
    }
}

function deleteMaterialCard(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  var item = new MaterialCard(itemFormClient);
  //Logger.log(JSON.stringify(item));
  item.deleteFromDb();
  item.deleteFromScrum([]);
  item.deleteGdFolder();
}
