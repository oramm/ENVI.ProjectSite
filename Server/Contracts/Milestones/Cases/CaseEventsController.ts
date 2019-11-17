function getCaseEventsList(initParamObject, externalConn?: GoogleAppsScript.JDBC.JdbcConnection) {
  var milestoneConditon = (initParamObject && initParamObject.milestoneId) ? 'Milestones.Id=' + initParamObject.milestoneId : '1';

  var sql = 'SELECT  Letters.Id, \n \t' +
    'Letters.IsOur, \n \t' +
    'Letters.Number, \n \t' +
    'Letters.Description, \n \t' +
    'Letters.CreationDate AS EventDate,  \n \t' +
    'Letters.RegistrationDate, \n \t' +
    'Letters.LetterGdId AS EventGdId, \n \t' +
    'Letters.FolderGdId AS EventFolderGdId, \n \t' +
    'Letters.LastUpdated, \n \t' +
    'Letters.ProjectId, \n \t' +
    'Cases.Id AS CaseId, \n \t' +
    'Contracts.Id AS ContractId, \n \t' +
    'Persons.Id AS EventOwnerId, \n \t' +
    'Persons.Name AS EventOwnerName, \n \t' +
    'Persons.Surname AS EventOwnerSurname, \n \t' +
    'NULL AS MeetingId, \n \t' +
    'NULL AS Name, \n \t' +
    'NULL AS EventDeadline \n' +

    'FROM Letters \n' +
    'JOIN Letters_Cases ON Letters_Cases.LetterId=Letters.Id \n' +
    'JOIN Cases ON Letters_Cases.CaseId=Cases.Id \n' +
    'JOIN Milestones ON Cases.MilestoneId=Milestones.Id \n' +
    'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
    'JOIN Projects ON Contracts.ProjectOurId=Projects.OurId \n' +
    'JOIN Persons ON Letters.EditorId=Persons.Id \n' +
    'WHERE ' + milestoneConditon + '\n \n' +

    'UNION \n \n' +

    'SELECT MeetingArrangements.Id, \n \t' +
    'NULL, \n \t' +
    'NULL, \n \t' +
    'MeetingArrangements.Description, \n \t' +
    'Meetings.Date AS EventDate, \n \t' +
    'NULL, \n \t' +
    'Meetings.ProtocolGdId AS EventGdId, \n \t' +
    'NULL, \n \t' +
    'MeetingArrangements.LastUpdated, \n \t' +
    'NULL, \n \t' +
    'Cases.Id AS CaseId, \n \t' +
    'Contracts.Id AS ContractId, \n \t' +
    'Persons.Id AS EventOwnerId, \n \t' +
    'Persons.Name AS OwnerName, \n \t' +
    'Persons.Surname AS OwnerSurname, \n \t' +
    'MeetingArrangements.MeetingId, \n \t' +
    'MeetingArrangements.Name, \n \t' +
    'MeetingArrangements.Deadline AS EventDeadline \n' +
    'FROM MeetingArrangements \n' +
    'JOIN Meetings ON MeetingArrangements.MeetingId=Meetings.Id \n' +
    'JOIN Cases ON MeetingArrangements.CaseId=Cases.Id \n' +
    'JOIN Milestones ON Cases.MilestoneId=Milestones.Id \n' +
    'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
    'JOIN Persons ON MeetingArrangements.OwnerId=Persons.Id \n' +
    'WHERE ' + milestoneConditon + '\n \n' +

    'ORDER BY EventDate';

  return getCaseEvents(sql, initParamObject, externalConn)
}

function getCaseEventsListPerMilestone(milestoneId) {
  return getCaseEventsList({ milestoneId: milestoneId })
}
function test_getCaseEventsListPerMilestone() {
  getCaseEventsList({ milestoneId: '782' });
}

function getCaseEvents(sql: string, initParamObject, externalConn?: GoogleAppsScript.JDBC.JdbcConnection) {
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    if (!conn.isValid(0)) throw new Error('getLetters:: połączenie przerwane');

    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);
    var _letterEntitiesPerProject = getLetterEntityAssociationsPerProjectList(initParamObject.projectId, conn);
    var item;
    while (dbResults.next()) {
      if (dbResults.getString('Number') && !dbResults.getString('Name')) {
        var _letterEntitiesMainPerLetter = _letterEntitiesPerProject.filter(function (item) {
          return item.letterId == dbResults.getLong('Id') && item.letterRole == 'MAIN';
        });
        var _letterEntitiesCcPerLetter = _letterEntitiesPerProject.filter(function (item) {
          return item.letterId == dbResults.getLong('Id') && item.letterRole == 'Cc';
        });
        item = new Letter({
          id: dbResults.getLong('Id'),
          isOur: dbResults.getBoolean('IsOur'),
          number: dbResults.getString('Number'),
          description: dbResults.getString('Description'),
          creationDate: dbResults.getString('EventDate'),
          registrationDate: dbResults.getString('RegistrationDate'),
          letterGdId: dbResults.getString('EventGdId'),
          folderGdId: dbResults.getString('EventFolderGdId'),
          _lastUpdated: dbResults.getString('LastUpdated'),
          _entitiesMain: _letterEntitiesMainPerLetter.map(function (item) {
            return item._entity;
          }),
          _entitiesCc: _letterEntitiesCcPerLetter.map(function (item) {
            return item._entity;
          }),
          _editor: {
            id: dbResults.getInt('EventOwnerId'),
            name: dbResults.getString('EventOwnerName'),
            surname: dbResults.getString('EventOwnerSurname'),
          },
          _project: {
            id: dbResults.getString('ProjectId'),
          }
        });
        item._eventType = 'LETTER'
      } else {
        item = new MeetingArrangement({
          id: dbResults.getLong('Id'),
          name: dbResults.getString('Name'),
          description: dbResults.getString('Description'),
          deadline: dbResults.getString('EventDeadline'),
          _lastUpdated: dbResults.getString('LastUpdated'),
          _owner: {
            id: dbResults.getLong('EventOwnerId'),
            name: dbResults.getString('EventOwnerName'),
            surname: dbResults.getString('EventOwnerSurname'),
          },
          _parent: new Meeting({
            id: dbResults.getString('MeetingId'),
            date: dbResults.getString('EventDate'),
            protocolGdId: dbResults.getString('EventGdId')
          }),
          _case: {
            id: dbResults.getLong('CaseId'),
          }
        });
        item._eventType = 'MEETING_ARRENGEMENT';
        item._documentEditUrl = item._parent._documentEditUrl;
      }
      item._case = { id: dbResults.getLong('CaseId') };

      result.push(item);
    }

    return result;
  } catch (e) {
    Logger.log(e);
    throw e;
  } finally {
    if (!externalConn && conn.isValid(0)) conn.close();
  }
}