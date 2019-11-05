function getMeetingsList(initParamObject, externalConn) {
  var projectConditon = (initParamObject && initParamObject.projectId)? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';
  var contractConditon = (initParamObject && initParamObject.contractId)? 'Meetings.ContractId=' + initParamObject.contractId : '1';
  
  var sql = 'SELECT  Meetings.Id, \n \t' +
                    'Meetings.Name, \n \t' +
                    'Meetings.Description, \n \t' +
                    'Meetings.Date, \n \t' +
                    'Meetings.ProtocolGdId, \n \t' +
                    'Meetings.Location, \n \t' +
                    'Contracts.Id AS ContractId, \n \t' +
                    'Contracts.Number AS ContractNumber, \n \t' +
                    'Contracts.Name AS ContractName, \n \t' +
                    'Contracts.GdFolderId AS ContractGdFolderId, \n \t' +
                    'OurContractsData.OurId AS ContractOurId, \n \t' +
                    'Contracts.Name AS ContractName, \n \t' +
                    'Contracts.Name AS ContractName, \n \t' +
                    'Contracts.Name AS ContractName, \n \t' +
                    'ContractTypes.Id AS ContractTypeId, \n \t' +
                    'ContractTypes.Name AS ContractTypeName, \n \t' +
                    'ContractTypes.IsOur AS ContractTypeIsOur, \n \t' +
                    'ContractTypes.Id AS ContractTypeDescription, \n \t' +
                    'Projects.OurId AS ProjectOurId, \n \t' +
                    'Projects.Name AS ProjectName, \n \t' +
                    'Projects.GdFolderId AS ProjectGdFolderId \n' +
            'FROM Meetings \n' + 
            'JOIN Contracts ON Contracts.Id=Meetings.ContractId \n' +
            'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.id \n' +
            'JOIN ContractTypes ON ContractTypes.Id = Contracts.TypeId \n' +
            'JOIN Projects ON Projects.OurId=Contracts.ProjectOurId \n' +
            'WHERE ' + projectConditon + ' AND ' + contractConditon;
  return getMeetings(sql, externalConn)
}

function getMeetingsListPerContract(contractId) {
  return getMeetingsList({contractId:contractId});
}
function test_getMeetingsListPerContract(){
  getMeetingsListPerContract("224");
}

function getMeetings(sql, externalConn){
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    if(!conn.isValid(0)) throw new Error ('getMeetings:: połączenie przerwane');
    
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      
      var item = new Meeting({id: dbResults.getLong('Id'),
                              name: dbResults.getString('Name'),
                              description: dbResults.getString('Description'),
                              date: dbResults.getString('Date'),
                              protocolGdId: dbResults.getString('ProtocolGdId'),
                              location: dbResults.getString('Location'),
                              _contract: {id: dbResults.getLong('ContractId'),
                                          number: dbResults.getString('ContractNumber'),
                                          name: sqlToString(dbResults.getString('ContractName')),
                                          gdFolderId: dbResults.getString('ContractGdFolderId'),
                                          ourId: dbResults.getString('ContractOurId'),
                                          _parent:{ourId: dbResults.getString('ProjectOurId'),
                                                   name: dbResults.getString('ProjectName'),
                                                   gdFolderId: dbResults.getString('ProjectGdFolderId')
                                                  },
                                          _type: {id: dbResults.getInt('ContractTypeId'),
                                                  name: dbResults.getString('ContractTypeName'),
                                                  description: dbResults.getString('ContractTypeDescription'),
                                                  isOur: dbResults.getBoolean('ContractTypeIsOur')
                                                 }
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

function test_addNewMeeting(){
  addNewMeeting('');
}

function addNewMeeting(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new Meeting(itemFormClient);
    try{
      var conn = connectToSql();
      conn.setAutoCommit(false);
      item.addInDb(conn);
      conn.commit();
      Logger.log(' item Added ItemId: ' + item.id);
      return item;
    } catch (err) {
      if(conn && conn.isValid(0)) conn.rollback();
      Logger.log(JSON.stringify(err));
      throw err;
    } finally {
      if(conn && conn.isValid(0)) conn.close();
    } 
}

function test_createMeetingProtocol(){
  createMeetingProtocol('');
}

function createMeetingProtocol(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Meeting(itemFormClient);
  try{
    item.deleteProtocolFromGd();
    item.createProtocol();
    item.editInDb();
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    throw err;
  } 
}


function editMeeting(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Meeting(itemFormClient);
  
  try{ 
    var conn = connectToSql();
    conn.setAutoCommit(false);
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

function deleteMeeting(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new Meeting(itemFormClient);
    item.deleteProtocolFromGd();
    
    var conn = connectToSql();
    conn.setAutoCommit(false);
    item.deleteFromDb();
    conn.commit();
  } catch(err){
      Logger.log(JSON.stringify(err));
    if(conn && conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn && conn.isValid(0)) conn.close();
  }
}