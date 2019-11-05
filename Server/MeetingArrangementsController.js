function getMeetingArrangementsList(initParamObject, externalConn) {
  var projectCondition = (initParamObject && initParamObject.projectOurId)? 'Contracts.ProjectOurId="' + initParamObject.projectOurId + '"' : '1';
  var contractCondition = (initParamObject && initParamObject.contractId)? 'Contracts.Id=' + initParamObject.contractId : '1';
  var meetingCondition = (initParamObject && initParamObject.meetingId)? 'MeetingArrangements.MeetingId=' + initParamObject.meetingId : '1';
  var caseConditon = (initParamObject && initParamObject.caseId)? 'MeetingArrangements.CaseId=' + initParamObject.caseId : '1';
  
  var sql = 'SELECT  MeetingArrangements.Id, \n \t' +
                    'MeetingArrangements.MeetingId, \n \t' +
                    'MeetingArrangements.Name, \n \t' +
                    'MeetingArrangements.Description, \n \t' +
                    'MeetingArrangements.Deadline, \n \t' +
                    'MeetingArrangements.LastUpdated, \n \t' +
                    'Cases.Id AS CaseId, \n \t' +
                    'Cases.Name AS CaseName, \n \t' +
                    'CaseTypes.Id AS CaseTypeId, \n \t' +
                    'CaseTypes.Name AS CaseTypeName, \n \t' +
                    'CaseTypes.FolderNumber, \n \t' +
                    'Milestones.Id AS MilestoneId, \n \t' +
                    'Milestones.Name AS MilestoneName, \n \t' +
                    'Contracts.Id AS ContractId, \n \t' +
                    'Contracts.Number AS ContractNumber, \n \t' +
                    'Contracts.Name AS ContractName, \n \t' +
                    'CaseTypes.FolderNumber, \n \t' +
                    'Persons.Id AS OwnerId, \n \t' +
                    'Persons.Name AS OwnerName, \n \t' +
                    'Persons.Surname AS OwnerSurname, \n \t' + 
                    'Persons.Email AS OwnerEmail \n' + 
            'FROM MeetingArrangements \n' +
            'JOIN Cases ON MeetingArrangements.CaseId=Cases.Id \n' +
            'JOIN CaseTypes ON Cases.TypeId=CaseTypes.Id \n' +
            'JOIN Milestones ON Cases.MilestoneId=Milestones.Id \n' +
            'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
            'LEFT JOIN Persons ON MeetingArrangements.OwnerId=Persons.Id \n' +
            'WHERE ' + projectCondition + ' AND ' + caseConditon + ' AND ' + meetingCondition;
  return getMeetingArrangements(sql, externalConn)
}

function getMeetingArrangementsListPerProject(projectOurId, externalConn) {
  return getMeetingArrangementsList({projectOurId: projectOurId});
}

function getMeetingArrangementsListPerContract(contractId, externalConn) {
  return getMeetingArrangementsList({contractId: contractId});
}

function getMeetingArrangementsListPerMeeting(meetingId, externalConn) {
  return getMeetingArrangementsList({meetingId: meetingId});
}

function test_getMeetingArrangements(){
  getMeetingArrangementsListPerMeeting(13);
}

function getMeetingArrangements(sql, externalConn){
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn)? externalConn : connectToSql();
    if(!conn.isValid(0)) throw new Error ('getMeetingArrangements:: połączenie przerwane');
    
    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      
      var item = new MeetingArrangement({id: dbResults.getLong('Id'),
                                         name: dbResults.getString('Name'),
                                         description: dbResults.getString('Description'),
                                         deadline: dbResults.getString('Deadline'),
                                         _lastUpdated: dbResults.getString('LastUpdated'),
                                         _owner: {id: dbResults.getLong('OwnerId'),
                                                  name: dbResults.getString('OwnerName'),
                                                  surname: dbResults.getString('OwnerSurname'),
                                                  email: dbResults.getString('OwnerEmail')
                                                 },
                                         _parent: {id: dbResults.getString('MeetingId')
                                                  },
                                         _case: {id: dbResults.getLong('CaseId'),
                                                 name: dbResults.getString('CaseName'),
                                                 _type:{id: dbResults.getInt('CaseTypeId'),
                                                        name: dbResults.getString('CaseTypeName'),
                                                        folderNumber: dbResults.getString('FolderNumber')
                                                       },
                                                 _parent: {id: dbResults.getLong('MilestoneId'),
                                                           name: dbResults.getString('MilestoneName'),
                                                           _parent: {id: dbResults.getLong('ContractId'),
                                                                     name: dbResults.getString('ContractName'),
                                                                     number: dbResults.getString('ContractNumber')
                                                                    }
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

function test_addNewMeetingArrangement(){
  addNewMeetingArrangement('')
}

function addNewMeetingArrangement(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new MeetingArrangement(itemFormClient);
    try{
      var conn = connectToSql();
      conn.setAutoCommit(false);
      item.addInDb(conn);
      conn.commit();
      
      Logger.log(' item Added ItemId: ' + item.id);
      
      return item;
    } catch (err) {
      if(conn.isValid(0)) conn.rollback();
      throw err;
    } finally {
      if(conn.isValid(0)) conn.close();
    }
}

function test_editMeetingArrangement(){
  editMeetingArrangement('')
}


function editMeetingArrangement(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new MeetingArrangement(itemFormClient);
  
  try{ 
    var conn = connectToSql();
    item.editInDb(conn, true);
    conn.commit();
    Logger.log('item edited ItemId: ' + item.id);
    return item;
  } catch (err) {
    Logger.log(JSON.stringify(err));
    if(conn.isValid(0)) conn.rollback();
    throw err;
  } finally {
    if(conn.isValid(0)) conn.close();
  }
}

function deleteMeetingArrangement(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  try{
    var item = new MeetingArrangement(itemFormClient);
    item.deleteFromDb();
  } catch(err){
      throw err;
  }
}