function getMilestonesList(initParamObject) {
    var projectCondition = (initParamObject && initParamObject.projectId) ? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';
    var contractCondition = (initParamObject && initParamObject.contractId) ? 'Milestones.ContractId=' + initParamObject.contractId : '1';
    try {

        var sql = 'SELECT  Milestones.Id, \n \t' +
            'MilestoneTypes.Id AS TypeId, \n \t' +
            'MilestoneTypes.Name AS TypeName, \n \t' +
            'MilestoneTypes_ContractTypes.FolderNumber, \n \t' +
            'MilestoneTypes_ContractTypes.IsDefault AS TypeIsDefault, \n \t' +
            'MilestoneTypes.IsUniquePerContract AS TypeIsUniquePerContract, \n \t' +
            'Milestones.Name, \n \t' +
            'Milestones.Description, \n \t' +
            'Milestones.StartDate, \n \t' +
            'Milestones.EndDate, \n \t' +
            'Milestones.Status, \n \t' +
            'Milestones.GdFolderId, \n \t' +
            'OurContractsData.OurId AS ParentOurId, \n \t' +
            'OurContractsData.ManagerId AS ParentManagerId, \n \t' +
            'OurContractsData.AdminId AS ParentAdminId, \n \t' +
            'Contracts.Id AS ParentId, \n \t' +
            'Contracts.Number AS ParentNumber, \n \t' +
            'Contracts.OurIdRelated AS ParentOurIdRelated, \n \t' +
            'ContractTypes.Id AS ContractTypeId, \n \t' +
            'ContractTypes.Name AS ContractTypeName, \n \t' +
            'ContractTypes.Description AS ContractTypeDescription, \n \t' +
            'ContractTypes.IsOur AS ContractTypeIsOur, \n \t' +
            'Contracts.ProjectOurId \n' +
            'FROM Milestones \n' +
            'JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
            'JOIN Contracts ON Milestones.ContractId = Contracts.Id \n' +
            'LEFT JOIN ContractTypes ON ContractTypes.Id = Contracts.TypeId \n' +
            'LEFT JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n' +
            'LEFT JOIN OurContractsData ON OurContractsData.ContractId=Milestones.ContractId \n' +
            'WHERE ' + projectCondition + ' AND ' + contractCondition + '\n' +
            //'GROUP BY Milestones.Id \n' +
            'ORDER BY MilestoneTypes_ContractTypes.FolderNumber';

        Logger.log(sql);

        var result = [];
        var conn = connectToSql();
        var stmt = conn.createStatement();

        var dbResults = stmt.executeQuery(sql);
        while (dbResults.next()) {
            var item = new Milestone({
                id: dbResults.getLong('Id'),
                _type: {
                    id: dbResults.getLong('TypeId'),
                    name: dbResults.getString('TypeName'),
                    isUniquePerContract: dbResults.getBoolean('TypeIsUniquePerContract'),
                    _isDefault: dbResults.getBoolean('TypeIsDefault'),
                    _folderNumber: dbResults.getString('FolderNumber'),
                },
                name: dbResults.getString('Name'),
                description: dbResults.getString('Description'),
                startDate: dbResults.getString('StartDate'),
                endDate: dbResults.getString('EndDate'),
                status: dbResults.getString('Status'),
                gdFolderId: dbResults.getString('GdFolderId'),
                //może to być kontrakt na roboty (wtedy ma _ourContract), albo OurContract(wtedy ma OurId)
                _parent: new Contract({
                    id: dbResults.getLong('ParentId'),
                    ourId: dbResults.getString('ParentOurId'),
                    number: dbResults.getString('ParentNumber'),
                    _ourContract: { ourId: dbResults.getString('ParentOurIdRelated') },
                    _manager: { id: dbResults.getLong('ParentManagerId') },
                    _admin: { id: dbResults.getLong('ParentAdminId') },
                    projectId: dbResults.getString('ProjectOurId'),
                    _type: {
                        id: dbResults.getInt('ContractTypeId'),
                        name: dbResults.getString('ContractTypeName'),
                        description: dbResults.getString('ContractTypeDescription'),
                        isOur: dbResults.getBoolean('ContractTypeIsOur')
                    }
                }, undefined)
            });
            item._FolderNumber_TypeName_Name = item._type._folderNumber + ' ' + item._type.name + ' | ' + item.name;
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

function getCurrentMilestonesList() {
    var currentUserSystemRole = Setup.getSystemRole(undefined);

    try {
        var result = [];
        var conn = connectToSql();
        var stmt = conn.createStatement();

        var onlyMyMilestonesCondition;
        if (currentUserSystemRole.name == 'ENVI_MANAGER')
            onlyMyMilestonesCondition = 'TRUE'
        else //if (currentUserSystemRole.name == 'ENVI_EMPLOYEE')
            onlyMyMilestonesCondition = 'OurContractsData.ManagerId=' + currentUserSystemRole.personId;

        var sql = 'SELECT Milestones.Id, \n \t' +
            'MilestoneTypes.Id AS TypeId, \n \t' +
            'MilestoneTypes.Name AS TypeName, \n \t' +
            'MilestoneTypes_ContractTypes.FolderNumber, \n \t' +
            'MilestoneTypes_ContractTypes.IsDefault AS TypeIsDefault, \n \t' +
            'MilestoneTypes.IsUniquePerContract AS TypeIsUniquePerContract, \n \t' +
            'Milestones.Name, \n \t' +
            'Milestones.Description, \n \t' +
            'Milestones.StartDate, \n \t' +
            'Milestones.EndDate, \n \t' +
            'Milestones.Status, \n \t' +
            'Milestones.GdFolderId, \n \t' +
            'OurContractsData.OurId AS ParentOurId, \n \t' +
            'OurContractsData.ManagerId AS ParentManagerId, \n \t' +
            'OurContractsData.AdminId AS ParentAdminId, \n \t' +
            'Contracts.Id AS ParentId, \n \t' +
            'Contracts.Number AS ParentNumber, \n \t' +
            'Contracts.OurIdRelated AS ParentOurIdRelated, \n \t' +
            'ContractTypes.Id AS ContractTypeId, \n \t' +
            'ContractTypes.Name AS ContractTypeName, \n \t' +
            'ContractTypes.Description AS ContractTypeDescription, \n \t' +
            'ContractTypes.IsOur AS ContractTypeIsOur, \n \t' +
            'Managers.Name AS ManagerName, \n \t' +
            'Managers.Surname AS ManagerSurname, \n \t' +
            'Projects.Id AS ProjectId, \n \t' +
            'Projects.Name AS ProjectName \n' +
            'FROM Milestones  \n' +
            'LEFT JOIN MilestoneTypes ON Milestones.typeId=MilestoneTypes.Id \n' +
            'JOIN Contracts ON Milestones.ContractId = Contracts.Id \n' +
            'LEFT JOIN ContractTypes ON ContractTypes.Id = Contracts.TypeId \n' +
            'LEFT JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n' +

            'JOIN OurContractsData ON OurContractsData.ContractId = Contracts.Id \n' +
            'JOIN Projects ON Contracts.ProjectOurId=Projects.Id \n' +
            'LEFT JOIN Persons AS Admins ON Admins.Id=OurContractsData.AdminId \n' +
            'LEFT JOIN Persons AS Managers ON Managers.Id=OurContractsData.ManagerId \n' +
            'WHERE Milestones.EndDate< DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY) AND Milestones.Status<>"Zrobione" AND ' + onlyMyMilestonesCondition + '\n' +
            'GROUP BY Milestones.Id \n' +
            'ORDER BY Milestones.EndDate';
        Logger.log(sql);
        var dbResults = stmt.executeQuery(sql);
        while (dbResults.next()) {
            var item = new Milestone({
                id: dbResults.getLong('Id'),
                _type: {
                    id: dbResults.getLong('TypeId'),
                    name: dbResults.getString('TypeName'),
                    _isDefault: dbResults.getBoolean('TypeIsDefault'),
                    isUniquePerContract: dbResults.getBoolean('TypeIsUniquePerContract'),
                    _folderNumber: dbResults.getString('FolderNumber'),
                },
                name: dbResults.getString('Name'),
                description: dbResults.getString('Description'),
                startDate: dbResults.getString('StartDate'),
                endDate: dbResults.getString('EndDate'),
                status: dbResults.getString('Status'),
                gdFolderId: dbResults.getString('GdFolderId'),
                //może to być kontrakt na roboty (wtedy ma _ourContract), albo OurContract(wtedy ma OurId)
                _parent: new Contract({
                    id: dbResults.getLong('ParentId'),
                    ourId: dbResults.getString('ParentOurId'),
                    number: dbResults.getString('ParentNumber'),
                    _ourContract: { ourId: dbResults.getString('ParentOurIdRelated') },
                    _manager: {
                        id: dbResults.getLong('ParentManagerId'),
                        name: dbResults.getString('ManagerName'),
                        surname: dbResults.getString('ManagerSurname')
                    },
                    _admin: { id: dbResults.getLong('ParentAdminId') },
                    projectId: dbResults.getString('ProjectOurId'),
                    _type: {
                        id: dbResults.getInt('ContractTypeId'),
                        name: dbResults.getString('ContractTypeName'),
                        description: dbResults.getString('ContractTypeDescription'),
                        isOur: dbResults.getBoolean('ContractTypeIsOur'),
                    }
                }, undefined)
            });

            if (item._parent._manager.name)
                item._parent._manager._nameSurnameEmail = item._parent._manager.name.trim() + ' ' + item._parent._manager.surname.trim();

            //item.projectId = dbResults.getString('ProjectOurId');
            //item.projectName = dbResults.getString('ProjectName');
            result.push(item);
        }
        return result;
    } catch (e) {
        Logger.log(e);
        throw e;
    } finally {
        if (conn && !conn.isClosed()) conn.close();
    }
}

function getMilestonesList_Test() {
    var x = getMilestonesList('KOB.GWS.01.WLASNE');
    return x;
}


function addNewMilestone(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new Milestone(itemFromClient);
    var contract = new Contract(item._parent, undefined);
    item._parent = contract; //potrzebne bo chcę mieć dostęp do funkcji obiektu
    try {
        var gd = new Gd(contract);
        var milestoneFolders = gd.createMilestoneFolders(item);
        item.gdFolderId = milestoneFolders[0].gdFolderId;
        item._gdFolderUrl = Gd.createGdFolderUrl(item.gdFolderId);
        Logger.log('Utworzono Foldery kamienia i spraw domyślnych');
        var conn = connectToSql();
        conn.setAutoCommit(false);
        item.addInDb(conn, true);
        var defaultItems = item.createDefaultCasesInDb({
            foldersGdData: milestoneFolders,
            externalConn: conn,
            isPartOfTransaction: true
        });
        conn.commit();

        item._parent.createDefaultTasksInScrum(defaultItems);

        Logger.log(' item Added ItemId: ' + item.id);
        return item;
    } catch (err) {
        Logger.log(JSON.stringify(err));
        if (conn && conn.isValid(0)) conn.rollback();
        deleteMilestone(JSON.stringify(item));
        item.deleteFromScrum();

        throw err;
    } finally {
        if (conn && conn.isValid(0)) conn.close();
    }
}

function test_addNewMilestone() {
    addNewMilestone(''
    );
}

function editMilestone(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var item = new Milestone(itemFromClient);
    Logger.log(item.gdFolderId);
    var parentContract = new Contract(item._parent, undefined);
    //parentContract.getCaseTypes(); return;
    var gd = new Gd(parentContract);
    // potrzebne bo gdy nie ma wcześniej dodanego folderu edycja powoduje utworzenie folderu, co trzeba zapisać
    var milestoneFolder = gd.editMilestoneFolder(item);
    item.gdFolderId = milestoneFolder.gdFolderId;
    item._gdFolderUrl = Gd.createGdFolderUrl(item.gdFolderId);


    item.editInDb();
    item.editInScrum();
    Logger.log(item.gdFolderId);
    Logger.log('item edited ItemId: ' + item.id);
    return item;
}

function test_editMilestone() {
    editMilestone('');
}

function deleteMilestone(itemFromClient) {
    itemFromClient = JSON.parse(itemFromClient);
    var message = 'Kamień sostał usunięty';
    var item = new Milestone(itemFromClient);
    item.id = itemFromClient.id;
    if (item.id) {
        item.deleteFromDb();
        item.deleteFromScrum();
        message += ' z bazy i ze Scruma';
    }
    message += ' ,usunięto foldery kamienia';

    var folder = DriveApp.getFolderById(item.gdFolderId);
    folder.setTrashed(true);
    Logger.log(message);
}

// Write all milestones to DB  in a single batch.
function writeAllMilestonesInDbFromContractsRegistry() {
    var milestonesRegistryFirstDataRow = 2;
    var milestonesSpreadsheet = SpreadsheetApp.openById('1npONCefyQazSlfqLWdKxyIWSspTZR_Ack0qw-xP1wzg');
    var milestonesSheetName = "DataBase";
    var milestonesRegistryResponsesSheet = milestonesSpreadsheet.getSheetByName(milestonesSheetName);
    var milestonesRegistryDataValues = milestonesRegistryResponsesSheet.getDataRange().getValues();

    var start = new Date();

    for (var i = milestonesRegistryFirstDataRow; i < milestonesRegistryDataValues.length; i++) {
        var dataRow = milestonesRegistryDataValues[i];

        if (dataRow[milestonesRegistryDataValues[0].indexOf("Co rejestrujesz?")] == "Termin pośredni (etap)" && dataRow[milestonesRegistryDataValues[0].indexOf(DB_STATUS_COL_NAME)] == "") {

            var ourContractId = dataRow[milestonesRegistryDataValues[0].indexOf("Oznaczenie zlecenia")];
            var milestone = new Milestone({
                name: stringToSql(dataRow[milestonesRegistryDataValues[0].indexOf("Przedmiot umowy / etapu / aneksu")]),
                contractId: milestone.getContractDbId(ourContractId),
                description: stringToSql(dataRow[milestonesRegistryDataValues[0].indexOf("Nazwa zamówienia")]),
                startDate: Utilities.formatDate(new Date(dataRow[milestonesRegistryDataValues[0].indexOf("Data podpisania")]), "CET", "yyyy-MM-dd"),
                endDate: Utilities.formatDate(new Date(dataRow[milestonesRegistryDataValues[0].indexOf("Termin zakończenia")]), "CET", "yyyy-MM-dd"),
                status: dataRow[milestonesRegistryDataValues[0].indexOf("Status")]
            });
            milestone.import = true;
            milestone.addInDb();

            milestonesRegistryResponsesSheet.getRange(i + 1, milestonesRegistryDataValues[0].indexOf(DB_STATUS_COL_NAME) + 1).setValue("MILESTONE WRITTEN");
        }
    }
    var end = new Date();
}