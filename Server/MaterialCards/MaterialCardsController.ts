function getMaterialCardsListPerContract(contractId?: number) {
    var contractConditon = (contractId) ? 'MaterialCards.ContractId="' + contractId + '"' : '1';

    var sql = 'SELECT MaterialCards.Id, \n \t' +
        'MaterialCards.Status, \n \t' +
        'MaterialCards.Name, \n \t' +
        'MaterialCards.Description, \n \t' +
        'MaterialCards.EngineersComment, \n \t' +
        'MaterialCards.EmployersComment, \n \t' +
        'MaterialCards.CreationDate, \n \t' +
        'MaterialCards.Deadline, \n \t' +
        'MaterialCards.LastUpdated, \n \t' +
        'MaterialCards.GdFolderId, \n \t' +
        'MaterialCards.ContractId, \n \t' +
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
        'Projects.GdFolderId AS ProjectGdFolderId, \n \t' +
        'Editors.Id AS EditorId, \n \t' +
        'Editors.Name AS EditorName, \n \t' +
        'Editors.Surname AS EditorSurname, \n \t' +
        'Editors.Email AS EditorEmail, \n \t' +
        'Owners.Id AS OwnerId, \n \t' +
        'Owners.Name AS OwnerName, \n \t' +
        'Owners.Surname AS OwnerSurname, \n \t' +
        'Owners.Email AS OwnerEmail \n' +
        'FROM MaterialCards \n' +
        'JOIN Contracts ON Contracts.Id=MaterialCards.ContractId \n' +
        'JOIN ContractTypes ON ContractTypes.Id = Contracts.TypeId \n' +
        'LEFT JOIN OurContractsData ON OurContractsData.ContractId = Contracts.Id \n' +
        'JOIN Projects ON Projects.OurId=Contracts.ProjectOurId \n' +
        'JOIN Persons AS Editors ON Editors.Id=MaterialCards.EditorId \n' +
        'JOIN Persons AS Owners ON Owners.Id=MaterialCards.OwnerId \n' +
        'WHERE ' + contractConditon + '\n' +
        'ORDER BY MaterialCards.Id DESC';
    Logger.log(sql);
    return getMaterialCards(sql, { contractId: contractId });
}
function test_getMaterialCardsListPerContract() {
    getMaterialCardsListPerContract(361)
}

function getMaterialCards(sql: string, initParamObject) {
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    try {
        var dbResults = stmt.executeQuery(sql);
        var versions: MaterialCardVersion[] = getMaterialCardsVersionsListPerContract(initParamObject.contractId);
        while (dbResults.next()) {
            var item = new MaterialCard({
                id: dbResults.getLong('Id'),
                name: dbResults.getString('Name'),
                description: dbResults.getString('Description'),
                engineersComment: dbResults.getString('EngineersComment'),
                employersComment: dbResults.getString('EmployersComment'),
                status: dbResults.getString('Status'),
                creationDate: dbResults.getString('CreationDate'),
                deadline: dbResults.getString('Deadline'),
                gdFolderId: dbResults.getString('GdFolderId'),
                contractId: dbResults.getLong('ContractId'),
                _lastUpdated: dbResults.getString('LastUpdated'),
                _contract: {
                    id: dbResults.getLong('ContractId'),
                    number: dbResults.getString('ContractNumber'),
                    name: sqlToString(dbResults.getString('ContractName')),
                    gdFolderId: dbResults.getString('ContractGdFolderId'),
                    ourId: dbResults.getString('ContractOurId'),
                    _parent: {
                        ourId: dbResults.getString('ProjectOurId'),
                        name: dbResults.getString('ProjectName'),
                        gdFolderId: dbResults.getString('ProjectGdFolderId')
                    },
                    _type: {
                        id: dbResults.getInt('ContractTypeId'),
                        name: dbResults.getString('ContractTypeName'),
                        description: dbResults.getString('ContractTypeDescription'),
                        isOur: dbResults.getBoolean('ContractTypeIsOur')
                    }
                },
                //ostatni edytujący
                _editor: {
                    id: dbResults.getLong('EditorId'),
                    name: dbResults.getString('EditorName'),
                    surname: dbResults.getString('EditorSurname'),
                    email: dbResults.getString('EditorEmail')
                },
                //odpowiedzialny za kolejną akcję
                _owner: {
                    id: dbResults.getLong('OwnerId'),
                    name: dbResults.getString('OwnerName'),
                    surname: dbResults.getString('OwnerSurname'),
                    email: dbResults.getString('OwnerEmail')
                },
                _versions: versions.filter(item => item.parentId == dbResults.getLong('Id'))
            });
            item._owner._nameSurnameEmail = item._owner.name + ' ' + item._owner.surname + ' ' + item._owner.email;
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

    try {
        var conn = connectToSql();
        conn.setAutoCommit(false);
        itemFormClient.externalConn = conn;
        var item = new MaterialCard(itemFormClient);

        var gdFolder = item.createGdFolder();
        item.gdFolderId = gdFolder.getId();
        item._gdFolderUrl = Gd.createGdFolderUrl(item.gdFolderId);

        item.addInDb(conn);
        conn.commit();
        item.editGdFolderName();

        Logger.log(' item Added ItemId: ' + item.id);

        return item;
    } catch (err) {
        if (conn && conn.isValid(0)) conn.rollback();
        if (gdFolder) gdFolder.setTrashed(true);
        Logger.log(JSON.stringify(err));
        throw err;
    } finally {
        if (conn && conn.isValid(0)) conn.close();
    }
}

function test_addMaterialCard() {
    addNewMaterialCard('');
}

function editMaterialCard(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new MaterialCard(itemFormClient);
    item.editGdFolderName();

    var conn = connectToSql();
    conn.setAutoCommit(false);
    try {
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

function deleteMaterialCard(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new MaterialCard(itemFormClient);
    //Logger.log(JSON.stringify(item));
    item.deleteFromDb();
    item.deleteGdFolder();
}

function makeContratcIdForMaterialCards() {
    var mcards = getMaterialCardsListPerContract();
    var conn = connectToSql();
    conn.setAutoCommit(false);
    try {
        for (var _i = 0, mcards_1 = mcards; _i < mcards_1.length; _i++) {
            var item = mcards_1[_i];
            item.contractId = item.getCaseData(conn).contractId;
            var stmt = conn.createStatement();
            var x = '';
            stmt.executeUpdate('UPDATE MaterialCards SET ContractId = ${item.contractId} WHERE id = ${item.id}');
            stmt.close();
            //item.editInDb(conn, true)
        }
        conn.commit();
    } catch (e) {
        Logger.log(JSON.stringify(item))
    } finally {
        conn.close();
    }

}


