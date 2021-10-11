function getIssuesListPerContract(contractId) {
    try {
        var result = [];
        var conn = connectToSql();
        var stmt = conn.createStatement();
        var sql = 'SELECT  Issues.Id, \n \t' +
            'Issues.Name, \n \t' +
            'Issues.ContractId, \n \t' +
            'Issues.Description, \n \t' +
            'Issues.Date, \n \t' +
            'Issues.Deadline, \n \t' +
            'Issues.SolvedDate, \n \t' +
            'Issues.ContractorsDescription, \n \t' +
            'Issues.Status, \n \t' +
            'Issues.OriginalId, \n \t' +
            'Issues.LastUpdated, \n \t' +
            'Issues.OwnerId, \n \t' +
            'Issues.GdFolderId, \n \t' +
            'Projects.OurId, \n \t' +
            'Contracts.GdFolderId, \n \t' +
            'OurContractsData.OurId, \n \t' +
            '(SELECT Name FROM Persons WHERE Persons.Id=Issues.OwnerId) AS OwnerName, \n \t' +
            '(SELECT Surname FROM Persons WHERE Persons.Id=Issues.OwnerId) AS OwnerSurname \n' +
            'FROM Issues \n' +
            'JOIN Contracts ON Issues.ContractId = Contracts.Id AND Issues.ContractId="' + contractId + '" \n' +
            'LEFT JOIN OurContractsData ON Issues.ContractId = OurContractsData.ContractId \n' +
            'JOIN Projects ON Contracts.ProjectOurId=Projects.OurId \n';
        Logger.log(sql);
        var dbResults = stmt.executeQuery(sql);
        while (dbResults.next()) {
            var item = {
                id: dbResults.getLong(1),
                name: dbResults.getString(2),
                contractId: dbResults.getString(3),
                description: dbResults.getString(4),
                date: dbResults.getString(5),
                deadline: dbResults.getString(6),
                solvedDate: dbResults.getString(7),
                contractorsDescription: dbResults.getString(8),
                status: dbResults.getString(9),
                originalId: dbResults.getString(10),
                _gdFolderUrl: Gd.createGdFolderUrl(dbResults.getString(13)),
                _lastUpdated: dbResults.getString(11),
                _owner: {
                    id: dbResults.getString(12),
                    _nameSurnameEmail: ''
                },
                _parent: {
                    id: dbResults.getString(3),
                    _gdFolderUrl: 'https://drive.google.com/drive/folders/' + dbResults.getString(15),
                    ourId: dbResults.getString(16),
                    projectId: dbResults.getString(14)
                    //_manager: {id: dbResults.getString(10)},
                    //_admin: {id: dbResults.getString(11)}
                }
            }

            var name = (dbResults.getString(17)) ? dbResults.getString(17) : '';
            var surname = (dbResults.getString(18)) ? dbResults.getString(18) : '';
            if (name)
                item._owner._nameSurnameEmail = name.trim() + ' ' + surname.trim();

            result.push(item);
        }

        dbResults.close();
        return result;
    } catch (e) {
        Logger.log(e);
        throw e;
    } finally {
        conn.close();
    }

}
function getIssuesListPerContract_Test() {
    var x = getIssuesListPerContract(224);
}

function getCurrentIssuesList() {
    var currentUser = new Person({ systemEmail: Session.getEffectiveUser().getEmail() });
    var currentUserSystemRole = currentUser.getSystemRole();

    try {
        var result = [];
        var conn = connectToSql();
        var stmt = conn.createStatement();

        var onlyMyIssuesCondition;
        if (currentUserSystemRole.name == 'EXTERNAL_USER')
            onlyMyIssuesCondition = 'OurContractsData.ManagerId=' + currentUser.id
        if (currentUserSystemRole.name == 'ENVI_MANAGER' || currentUserSystemRole.name == 'EXTERNAL_USER')
            onlyMyIssuesCondition = 'TRUE'

        var sql = 'SELECT  Issues.Id, \n \t' +
            'Issues.Name, \n \t' +
            'Issues.ContractId, \n \t' +
            'Issues.Description, \n \t' +
            'Issues.Date, \n \t' +
            'Issues.Deadline, \n \t' +
            'Issues.SolvedDate, \n \t' +
            'Issues.ContractorsDescription, \n \t' +
            'Issues.Status, \n \t' +
            'Issues.OriginalId, \n \t' +
            'Issues.LastUpdated, \n \t' +
            'Issues.OwnerId, \n \t' +
            'Issues.GdFolderId, \n \t' +
            'Projects.Id, \n \t' +
            'Contracts.GdFolderId, \n \t' +
            'OurContractsData.OurId, \n \t' +
            '(SELECT Name FROM Persons WHERE Persons.Id=Issues.OwnerId) AS OwnerName, \n \t' +
            '(SELECT Surname FROM Persons WHERE Persons.Id=Issues.OwnerId) AS OwnerSurname \n' +
            'FROM Issues  \n' +
            'JOIN Contracts ON Issues.ContractId = Contracts.Id \n' +
            'LEFT JOIN OurContractsData ON Issues.ContractId = OurContractsData.ContractId \n' +
            'JOIN Projects ON Contracts.ProjectOurId=Projects.Id \n' +
            'WHERE Issues.EndDate< DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY) AND Issues.Status<>"Zrobione" AND ' + onlyMyIssuesCondition + '\n' +
            //'GROUP BY Issues.Id \n' +
            'ORDER BY Issues.EndDate';
        Logger.log(sql);
        var dbResults = stmt.executeQuery(sql);
        while (dbResults.next()) {
            var item = {
                id: dbResults.getLong('Id'),
                name: dbResults.getString(2),
                contractId: dbResults.getLong(3),
                description: dbResults.getString(4),
                date: dbResults.getString(5),
                deadline: dbResults.getString(6),
                solvedDate: dbResults.getString(7),
                contractorsDescription: dbResults.getString(8),
                status: dbResults.getString(9),
                originalId: dbResults.getString(10),
                _gdFolderUrl: dbResults.getString(13),
                _lastUpdated: dbResults.getString(11),
                _owner: {
                    id: dbResults.getLong(12),
                    _nameSurnameEmail: ''
                },
                _parent: {
                    id: dbResults.getLong(3),
                    _gdFolderUrl: 'https://drive.google.com/drive/folders/' + dbResults.getString(15),
                    ourId: dbResults.getString(16),
                    projectId: dbResults.getString(14)
                    //_manager: {id: dbResults.getString(10)},
                    //_admin: {id: dbResults.getString(11)}
                }
            }

            var name = (dbResults.getString(17)) ? dbResults.getString(17) : '';
            var surname = (dbResults.getString(18)) ? dbResults.getString(18) : '';
            if (name)
                item._owner._nameSurnameEmail = name.trim() + ' ' + surname.trim();
            result.push(item);
        }
        return result;
    } catch (e) {
        Logger.log(e);
        throw e;
    } finally {
        conn.close();
    }
}

function addNewIssue(itemFromClient) {
    try {
        itemFromClient = JSON.parse(itemFromClient);
        var item = new Issue(itemFromClient);
        var gd = new Gd(new Contract(item._parent));
        gd.createIssueFolders(item);

        var conn = connectToSql();
        conn.setAutoCommit(false);
        item.addInDb(conn, true);
        conn.commit();
        Logger.log(' item Added ItemId: ' + item.id);
        return item;
    } catch (err) {
        Logger.log(JSON.stringify(err));
        if (conn && conn.isValid(0)) conn.rollback();
        throw err;
    } finally {
        if (conn && conn.isValid(0)) conn.close();
    }
}

function test_addNewIssue() {
    addNewIssue('');
}

function editIssue(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new Issue(itemFromClient);
    item.editInDb();
    Logger.log('item edited ItemId: ' + item.id);
    return item;
}

function test_editIssue() {
    editIssue('');
}

function deleteIssue(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new Issue(undefined);
    item.id = itemFromClient.id;
    item.deleteFromDb();
}