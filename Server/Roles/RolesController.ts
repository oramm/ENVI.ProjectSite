function getRolesPerProjectList(initParamObject) {
    var projectCondition = (initParamObject && initParamObject.projectOurId) ? 'Roles.ProjectOurId="' + initParamObject.projectOurId + '"' : '1';

    var sql = 'SELECT \n \t' +
        'Roles.Id, \n \t' +
        'Roles.ProjectOurId, \n \t' +
        'Roles.Name, \n \t' +
        'Roles.Description, \n \t' +
        'Roles.GroupName, \n \t' +
        'Roles.ManagerId, \n \t' +
        'Persons.Id AS PersonId, \n \t' +
        'Persons.Name AS PersonName, \n \t' +
        'Persons.Surname AS PersonSurName, \n \t' +
        'Persons.Email AS PersonEmail, \n \t' +
        'Persons.Cellphone AS PersonCellphone, \n \t' +
        'Persons.Phone AS PersonPhone, \n \t' +
        'Entities.Name AS EntityName, \n \t' +
        'Contracts.Id AS ContractId, \n \t' +
        'Contracts.Number AS ContractNumber, \n \t' +
        'OurContractsData.OurId AS ContractOurId, \n \t' +
        'SystemRoles.Name AS SystemRoleName\n' +
        'FROM Roles \n' +
        'JOIN Persons ON Persons.Id=Roles.PersonId \n' +
        'JOIN Entities ON Entities.Id=Persons.EntityId \n' +
        'JOIN SystemRoles ON SystemRoles.Id=Persons.SystemRoleId \n' +
        'LEFT JOIN Contracts ON Contracts.Id=Roles.ContractId \n' +
        'LEFT JOIN OurContractsData ON Contracts.Id=OurContractsData.Id \n' +
        'WHERE ' + projectCondition + ' \n' +
        'ORDER BY Roles.Name';

    return getRoles(sql, initParamObject);
}

function getRoles(sql: string, parentDataObject: any) {
    Logger.log(sql);
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    try {
        var dbResults = stmt.executeQuery(sql);
        while (dbResults.next()) {
            var item = new Role({
                id: dbResults.getLong('Id'),
                projectOurId: dbResults.getString('ProjectOurId'),
                name: dbResults.getString('Name'),
                description: dbResults.getString('Description'),
                _contract: {
                    id: dbResults.getLong('ContractId'),
                    ourId: dbResults.getString('ContractOurId'),
                    number: dbResults.getString('ContractNumber'),
                },
                _person: new Person({
                    id: dbResults.getLong('PersonId'),
                    name: dbResults.getString('PersonName').trim(),
                    surname: dbResults.getString('PersonSurName').trim(),
                    email: dbResults.getString('PersonEmail').trim(),
                    cellphone: dbResults.getString('PersonCellphone'),
                    phone: dbResults.getString('PersonPhone'),
                    _entity: {
                        name: (dbResults.getString('SystemRoleName') == 'ENVI_COOPERATOR') ? 'ENVI' : dbResults.getString('EntityName').trim()
                    },
                }),
                _group: {
                    id: dbResults.getString('GroupName'),
                    name: dbResults.getString('GroupName')
                },
                managerId: dbResults.getLong('ManagerId')
            })
            result.push(item);
        }
        dbResults.close();
        stmt.close();
        return result;
    } catch (e) {
        Logger.log(JSON.stringify(e));
        throw e;
    } finally {
        if (conn && conn.isValid(0)) conn.close();
    }
}

function addNewRole(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new Role(itemFromClient);

    item.addInDb();
    Logger.log(' item Added ItemId: ' + item.id);
    return item;
}

function editRole(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new Role(itemFromClient);
    item.editInDb();
    Logger.log('item edited ItemId: ' + item.id);
    return item;
}

function deleteRole(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new Role(undefined);
    item.id = itemFromClient.id;
    item.deleteFromDb();
}