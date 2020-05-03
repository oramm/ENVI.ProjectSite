function getRisksReactionsListPerProject(projectId) {
  var sql = 'SELECT  Tasks.Id, \n \t' +
    'Tasks.CaseId, \n \t' +
    'Tasks.Name, \n \t' +
    'Tasks.Description, \n \t ' +
    'Tasks.Deadline, \n \t' +
    'Tasks.Status, \n \t' +
    'Tasks.OwnerId, \n \t' +
    'Tasks.LastUpdated, \n \t' +
    'Contracts.Id, \n \t' +
    'Contracts.Number, \n \t' +
    'Contracts.Name, \n \t' +
    'Persons.Name, \n \t' +
    'Persons.Surname, \n \t' +
    'Persons.Email \n' +
    'FROM Tasks \n' +
    'JOIN Cases ON Cases.Id=Tasks.CaseId \n' +
    'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
    'JOIN Contracts ON Milestones.ContractId = Contracts.Id AND Contracts.ProjectOurId=' + prepareValueToSql(projectId) + '\n' +
    'JOIN OurContractsData ON Milestones.ContractId = OurContractsData.Id \n' +
    'LEFT JOIN Persons ON Persons.Id = Tasks.OwnerId';
  return getRisksReactions(sql);
}

function getRisksReactionsListPerContract(contractId) {
  var sql = 'SELECT  Tasks.Id, \n \t' +
    'Tasks.CaseId, \n \t' +
    'Tasks.Name, \n \t' +
    'Tasks.Description, \n \t ' +
    'Tasks.Deadline, \n \t' +
    'Tasks.Status, \n \t' +
    'Tasks.OwnerId, \n \t' +
    'Tasks.LastUpdated, \n \t' +
    'Contracts.Id, \n \t' +
    'Contracts.Number, \n \t' +
    'Contracts.Name, \n \t' +
    'Persons.Name, \n \t' +
    'Persons.Surname, \n \t' +
    'Persons.Email \n' +
    'FROM Tasks \n' +
    'JOIN Cases ON Cases.Id=Tasks.CaseId \n' +
    'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
    'JOIN Contracts ON Milestones.ContractId = Contracts.Id \n' +
    'JOIN OurContractsData ON Milestones.ContractId = OurContractsData.Id \n' +
    'LEFT JOIN Persons ON Persons.Id = Tasks.OwnerId \n' +
    'WHERE Contracts.Id=' + prepareValueToSql(contractId);
  return getRisksReactions(sql);
}

function getRisksReactions(sql) {
  var result = [];
  Logger.log(sql);
  var conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = {
        id: dbResults.getLong(1),
        caseId: dbResults.getLong(2),
        name: dbResults.getString(3),
        description: dbResults.getString(4),
        deadline: dbResults.getString(5),
        status: dbResults.getString(6),
        ownerId: dbResults.getInt(7),
        lastUpdated: dbResults.getString(8),
        _parent: {
          id: dbResults.getLong(2),
          //contractNumber: dbResults.getString(10),
          //contractName: dbResults.getString(11)
        },
        _nameSurnameEmail: ''
      };
      var name = (dbResults.getString(8)) ? dbResults.getString(12) : '';
      var surname = (dbResults.getString(9)) ? dbResults.getString(13) : '';
      var email = (dbResults.getString(10)) ? dbResults.getString(14) : '';
      if (name)
        item._nameSurnameEmail = name.trim() + ' ' + surname.trim() + ': ' + email.trim();

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

function test_getRisksListPerContract() {
  getRisksReactionsListPerContract("114")
}



