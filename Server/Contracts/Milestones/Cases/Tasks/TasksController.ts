function getTasksList(initParamObject, externalConn?: GoogleAppsScript.JDBC.JdbcConnection) {
  var contractCondition = (initParamObject && initParamObject.contractId) ? 'Contracts.Id=' + initParamObject.contractId : '1';
  var milestoneCondition = (initParamObject && initParamObject.milestoneId) ? 'Milestones.Id=' + initParamObject.milestoneId : '1';
  var contractStatusCondition = (initParamObject && initParamObject.contractStatusCondition) ? 'Contracts.Status REGEXP "' + initParamObject.contractStatusCondition + '"' : '1';

  var sql = 'SELECT  Tasks.Id, \n \t' +
    'Tasks.Name AS TaskName, \n \t' +
    'Tasks.Description AS TaskDescription, \n \t ' +
    'Tasks.Deadline AS TaskDeadline, \n \t' +
    'Tasks.Status AS TaskStatus, \n \t' +
    'Tasks.OwnerId, \n \t' +
    'Cases.Id AS CaseId, \n \t' +
    'Cases.Name AS CaseName, \n \t' +
    'Cases.TypeId AS CaseTypeId, \n \t' +
    'Cases.GdFolderId AS CaseGdFolderId, \n \t' +
    'CaseTypes.Id AS CaseTypeId, \n \t' +
    'CaseTypes.Name AS CaseTypeName, \n \t' +
    'CaseTypes.IsDefault, \n \t' +
    'CaseTypes.IsUniquePerMilestone, \n \t' +
    'CaseTypes.MilestoneTypeId, \n \t' +
    'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
    'Milestones.Id AS MilestoneId, \n \t' +
    'Milestones.ContractId, \n \t' +
    'Owners.Name AS OwnerName, \n \t' +
    'Owners.Surname AS OwnerSurname, \n \t' +
    'Owners.Email AS OwnerEmail \n' +
    'FROM Tasks \n' +
    'JOIN Cases ON Cases.Id=Tasks.CaseId \n' +
    'LEFT JOIN CaseTypes ON Cases.typeId=CaseTypes.Id \n' +
    'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
    'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
    'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
    'LEFT JOIN Persons AS Owners ON Owners.Id = Tasks.OwnerId \n' +
    'WHERE ' + contractCondition + ' AND ' + milestoneCondition + ' AND ' + contractStatusCondition;

  return getTasks(sql, externalConn);
}
function test_getTasksList() {
  getTasksList({ contractId: 114 })
}

function getTasks(sql: string, externalConn?: GoogleAppsScript.JDBC.JdbcConnection) {
  try {
    Logger.log(sql);
    var result = [];
    var conn = (externalConn) ? externalConn : connectToSql();
    if (!conn.isValid(0)) throw new Error('getTasks:: połączenie przerwane');

    var stmt = conn.createStatement();
    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {

      var item = new Task({
        id: dbResults.getLong('Id'),
        name: dbResults.getString('TaskName'),
        description: dbResults.getString('TaskDescription'),
        deadline: dbResults.getString('TaskDeadline'),
        status: dbResults.getString('TaskStatus'),
        _owner: {
          id: (dbResults.getLong('OwnerId')) ? dbResults.getLong('OwnerId') : undefined,
          name: (dbResults.getString('OwnerName')) ? dbResults.getString('OwnerName') : '',
          surname: (dbResults.getString('OwnerSurname')) ? dbResults.getString('OwnerSurname') : '',
          email: (dbResults.getString('OwnerEmail')) ? dbResults.getString('OwnerEmail') : ''
        },
        _parent: new Case({
          id: dbResults.getLong('CaseId'),
          name: dbResults.getString('CaseName'),
          gdFolderId: dbResults.getString('CaseGdFolderId'),
          _type: {
            id: dbResults.getInt('CaseTypeId'),
            name: dbResults.getString('CaseTypeName'),
            isDefault: dbResults.getBoolean('IsDefault'),
            isUniquePerMilestone: dbResults.getBoolean('isUniquePerMilestone'),
            milestoneTypeId: dbResults.getInt('MilestoneTypeId'),
            folderNumber: dbResults.getString('CaseTypeFolderNumber'),
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
    if (!externalConn && conn.isValid(0)) conn.close();
  }
}

function test_getTaskParents() {
  try {
    var item = new Task({ caseId: 108 });
    var conn = connectToSql();
    var t = item.getParents(conn);
    Logger.log(t);
  } catch (e) {
    throw e;
  } finally {
    conn.close();
  }
}

function addNewTask(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Task(itemFormClient);
  try {
    var conn = connectToSql();
    var newId = item.addInDb(conn);
    item.addInScrum(conn);
    Logger.log(' item Added ItemId: ' + item.id);
    return item;
  } catch (err) {
    throw err;
  } finally {
    if (conn && conn.isValid(0)) conn.close();
  }
}
//TODO przetestować
function test_editTask() {
  editTask('')
}

function editTask(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Task(itemFormClient);
  item.editInDb();
  item.editInScrum();
  Logger.log('item edited ItemId: ' + item.id);
  return item;
}

function deleteTask(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Task(undefined);
  item.id = itemFormClient.id;
  item.deleteFromDb();
  item.deleteFromScrum();
}

function test_deleteTask() {
  deleteTask('')
}