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
        'Contracts.Id AS ContractId, \n \t' +
        'Contracts.Number AS ContractNumber, \n \t' +
        'Contracts.Name AS ContractName, \n \t' +
        'Persons.Name AS OwnerName, \n \t' +
        'Persons.Surname AS OwnerSurname, \n \t' +
        'Persons.Email AS OwnerEmail \n' +
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
                id: dbResults.getLong('Id'),
                caseId: dbResults.getLong('CaseId'),
                name: dbResults.getString('Name'),
                description: dbResults.getString('Description'),
                deadline: dbResults.getString('Deadline'),
                status: dbResults.getString('Status'),
                ownerId: dbResults.getInt('OwnerId'),
                lastUpdated: dbResults.getString('LastUpdated'),
                _parent: {
                    id: dbResults.getLong('CaseId'),
                },
                _nameSurnameEmail: ''
            };
            var name = (dbResults.getString('OwnerName')) ? dbResults.getString('OwnerName') : '';
            var surname = (dbResults.getString('OwnerSurname')) ? dbResults.getString('OwnerSurname') : '';
            var email = (dbResults.getString('OwnerEmail')) ? dbResults.getString('OwnerEmail') : '';
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



