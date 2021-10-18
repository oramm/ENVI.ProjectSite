function test_getCasesListPerMilestone() {
    getCasesListPerMilestone("577")
}

function getCasesListPerMilestone(milestoneId) {
    var sql = 'SELECT Cases.Id, \n \t' +
        'CaseTypes.Id AS CaseTypeId, \n \t' +
        'CaseTypes.Name AS CaseTypeName, \n \t' +
        'CaseTypes.IsDefault, \n \t' +
        'CaseTypes.IsUniquePerMilestone, \n \t' +
        'CaseTypes.MilestoneTypeId, \n \t' +
        'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
        'Cases.Name, \n \t' +
        'Cases.Number, \n \t' +
        'Cases.Description, \n \t' +
        'Cases.GdFolderId, \n \t' +
        'Cases.LastUpdated, \n \t' +
        'Milestones.Id AS MilestoneId, \n \t' +
        'Milestones.ContractId, \n \t' +
        'Milestones.GdFolderId AS MilestoneGdFolderId, \n \t' +
        'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
        'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
        'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
        'OurContractsData.OurId AS ContractOurId, \n \t' +
        'Contracts.Alias AS ContractAlias, \n \t' +
        'Contracts.Number AS ContractNumber, \n \t' +
        'Contracts.Name AS ContractName, \n \t' +
        'Risks.Id AS RiskId, \n \t' +
        'Risks.Probability AS RiskProbability, \n \t' +
        'Risks.OverallImpact AS RiskOverallImpact \n' +
        'FROM Cases \n' +
        'LEFT JOIN CaseTypes ON Cases.TypeId=CaseTypes.Id \n' +
        'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
        'JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
        'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
        'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
        'LEFT JOIN Risks ON Risks.CaseId=Cases.Id \n' +
        'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n' +
        'WHERE MilestoneId=' + milestoneId + '\n' +
        'ORDER BY Cases.MilestoneId, CaseTypes.FolderNumber';

    return getCases(sql, { milestoneId: milestoneId });
}

function getCasesListPerContract(contractId) {
    var sql = 'SELECT Cases.Id, \n \t' +
        'CaseTypes.Id AS CaseTypeId, \n \t' +
        'CaseTypes.Name AS CaseTypeName, \n \t' +
        'CaseTypes.IsDefault, \n \t' +
        'CaseTypes.IsUniquePerMilestone, \n \t' +
        'CaseTypes.MilestoneTypeId, \n \t' +
        'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
        'Cases.Name, \n \t' +
        'Cases.Number, \n \t' +
        'Cases.Description, \n \t' +
        'Cases.GdFolderId, \n \t' +
        'Cases.LastUpdated, \n \t' +
        'Milestones.Id AS MilestoneId, \n \t' +
        'Milestones.ContractId, \n \t' +
        'Milestones.GdFolderId AS MilestoneGdFolderId, \n \t' +
        'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
        'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
        'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
        'OurContractsData.OurId AS ContractOurId, \n \t' +
        'Contracts.Alias AS ContractAlias, \n \t' +
        'Contracts.Number AS ContractNumber, \n \t' +
        'Contracts.Name AS ContractName, \n \t' +
        'Risks.Id AS RiskId, \n \t' +
        'Risks.Probability AS RiskProbability, \n \t' +
        'Risks.OverallImpact AS RiskOverallImpact \n' +
        'FROM Cases \n' +
        'LEFT JOIN CaseTypes ON Cases.TypeId=CaseTypes.Id \n' +
        'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
        'JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
        'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
        'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
        'LEFT JOIN Risks ON Risks.CaseId=Cases.Id \n' +
        'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n' +
        'WHERE Milestones.ContractId=' + contractId + '\n' +
        'ORDER BY Cases.MilestoneId, CaseTypes.FolderNumber';

    return getCases(sql, { contractId: contractId });
}

function getCasesListPerProject(initParamObject) {
    var projectCondition = (initParamObject && initParamObject.projectId) ? 'Contracts.ProjectOurId="' + initParamObject.projectId + '"' : '1';

    var sql = 'SELECT Cases.Id, \n \t' +
        'CaseTypes.Id AS CaseTypeId, \n \t' +
        'CaseTypes.Name AS CaseTypeName, \n \t' +
        'CaseTypes.IsDefault, \n \t' +
        'CaseTypes.IsUniquePerMilestone, \n \t' +
        'CaseTypes.MilestoneTypeId, \n \t' +
        'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
        'Cases.Name, \n \t' +
        'Cases.Number, \n \t' +
        'Cases.Description, \n \t' +
        'Cases.GdFolderId, \n \t' +
        'Cases.LastUpdated, \n \t' +
        'Milestones.Id AS MilestoneId, \n \t' +
        'Milestones.ContractId, \n \t' +
        'Milestones.GdFolderId AS MilestoneGdFolderId, \n \t' +
        'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
        'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
        'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
        'OurContractsData.OurId AS ContractOurId, \n \t' +
        'Contracts.Alias AS ContractAlias, \n \t' +
        'Contracts.Number AS ContractNumber, \n \t' +
        'Contracts.Name AS ContractName, \n \t' +
        'Risks.Id AS RiskId, \n \t' +
        'Risks.Probability AS RiskProbability, \n \t' +
        'Risks.OverallImpact AS RiskOverallImpact \n' +
        'FROM Cases \n' +
        'LEFT JOIN CaseTypes ON Cases.TypeId=CaseTypes.Id \n' +
        'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
        'JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
        'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
        'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
        'LEFT JOIN Risks ON Risks.CaseId=Cases.Id \n' +
        'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n' +
        'WHERE ' + projectCondition + ' \n' +
        'ORDER BY Contracts.Id, Milestones.Id, CaseTypes.FolderNumber';

    return getCases(sql, initParamObject);
}

/*
 * initParamObject {projectId, idsList} powinien zawierać parametr 'projectId', zprojectIdby nie pobierać wszystkich procesów w getCasesList()
 */
function getCasesListPerIdsList(initParamObject) {

    var sql = 'SELECT Cases.Id, \n \t' +
        'CaseTypes.Id AS CaseTypeId, \n \t' +
        'CaseTypes.Name AS CaseTypeName, \n \t' +
        'CaseTypes.IsDefault, \n \t' +
        'CaseTypes.IsUniquePerMilestone, \n \t' +
        'CaseTypes.MilestoneTypeId, \n \t' +
        'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
        'Cases.Name, \n \t' +
        'Cases.Number, \n \t' +
        'Cases.Description, \n \t' +
        'Cases.GdFolderId, \n \t' +
        'Cases.LastUpdated, \n \t' +
        'Milestones.Id AS MilestoneId, \n \t' +
        'Milestones.ContractId, \n \t' +
        'Milestones.GdFolderId AS MilestoneGdFolderId, \n \t' +
        'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
        'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
        'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
        'OurContractsData.OurId AS ContractOurId, \n \t' +
        'Contracts.Alias AS ContractAlias, \n \t' +
        'Contracts.Number AS ContractNumber, \n \t' +
        'Contracts.Name AS ContractName, \n \t' +
        'Risks.Id AS RiskId, \n \t' +
        'Risks.Probability AS RiskProbability, \n \t' +
        'Risks.OverallImpact AS RiskOverallImpact \n' +
        'FROM Cases \n' +
        'LEFT JOIN CaseTypes ON Cases.TypeId=CaseTypes.Id \n' +
        'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
        'JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
        'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
        'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
        'LEFT JOIN Risks ON Risks.CaseId=Cases.Id \n' +
        'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n' +
        'WHERE Id IN (' + initParamObject.idsList + ') \n' +
        'ORDER BY Cases.MilestoneId, CaseTypes.FolderNumber';

    return getCases(sql, initParamObject);
}

function getCasesList() {
    var sql = 'SELECT Cases.Id, \n \t' +
        'CaseTypes.Id AS CaseTypeId, \n \t' +
        'CaseTypes.Name AS CaseTypeName, \n \t' +
        'CaseTypes.IsDefault, \n \t' +
        'CaseTypes.IsUniquePerMilestone, \n \t' +
        'CaseTypes.MilestoneTypeId, \n \t' +
        'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
        'Cases.Name, \n \t' +
        'Cases.Number, \n \t' +
        'Cases.Description, \n \t' +
        'Cases.GdFolderId, \n \t' +
        'Cases.LastUpdated, \n \t' +
        'Milestones.Id AS MilestoneId, \n \t' +
        'Milestones.ContractId, \n \t' +
        'Milestones.GdFolderId AS MilestoneGdFolderId, \n \t' +
        'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
        'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
        'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneTypeFolderNumber, \n \t' +
        'OurContractsData.OurId AS ContractOurId, \n \t' +
        'Contracts.Alias AS ContractAlias, \n \t' +
        'Contracts.Number AS ContractNumber, \n \t' +
        'Contracts.Name AS ContractName, \n \t' +
        'Risks.Id AS RiskId, \n \t' +
        'Risks.Probability AS RiskProbability, \n \t' +
        'Risks.OverallImpact AS RiskOverallImpact \n' +
        'FROM Cases \n' +
        'LEFT JOIN CaseTypes ON Cases.TypeId=CaseTypes.Id \n' +
        'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
        'JOIN MilestoneTypes ON Milestones.TypeId=MilestoneTypes.Id \n' +
        'JOIN Contracts ON Milestones.ContractId=Contracts.Id \n' +
        'LEFT JOIN OurContractsData ON OurContractsData.Id=Contracts.Id \n' +
        'LEFT JOIN Risks ON Risks.CaseId=Cases.Id \n' +
        'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=Milestones.TypeId AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId \n';

    return getCases(sql, undefined);
}

function getCases(sql: string, parentDataObject: any) {
    Logger.log(sql);
    var result = [];
    var conn = connectToSql();
    var stmt = conn.createStatement();
    try {
        var dbResults = stmt.executeQuery(sql);
        var processes = getProcessesList(undefined, conn);
        var processesInstances;
        if (!parentDataObject)
            processesInstances = getProcessInstancesList(undefined, conn);
        //else if (parentDataObject.projectId)
        //  processesInstances = [];
        else if (parentDataObject.projectId || parentDataObject.contractId || parentDataObject.milestoneId)
            processesInstances = getProcessInstancesList(parentDataObject, conn);


        while (dbResults.next()) {
            var item = new Case({
                id: dbResults.getLong('Id'),
                _type: {
                    id: dbResults.getInt('CaseTypeId'),
                    name: dbResults.getString('CaseTypeName'),
                    isDefault: dbResults.getBoolean('IsDefault'),
                    isUniquePerMilestone: dbResults.getBoolean('isUniquePerMilestone'),
                    milestoneTypeId: dbResults.getInt('MilestoneTypeId'),
                    folderNumber: dbResults.getString('CaseTypeFolderNumber'),
                    _processes: processes.filter(function (item) {
                        return item._caseType.id == dbResults.getInt('CaseTypeId')
                    })
                },
                name: sqlToString(dbResults.getString('Name')),
                number: dbResults.getInt('Number'),
                description: sqlToString(dbResults.getString('Description')),
                gdFolderId: dbResults.getString('GdFolderId'),
                lastUpdated: dbResults.getString('LastUpdated'),
                _parent: {
                    id: dbResults.getLong('MilestoneId'),
                    contractId: dbResults.getLong('ContractId'),
                    gdFolderId: dbResults.getString('MilestoneGdFolderId'),
                    _type: {
                        id: dbResults.getLong('MilestoneTypeId'),
                        name: dbResults.getString('MilestoneTypeName'),
                        _folderNumber: dbResults.getString('MilestoneTypeFolderNumber'),
                    },
                    _parent: {
                        ourId: dbResults.getString('ContractOurId'),
                        number: dbResults.getString('ContractNumber'),
                        alias: dbResults.getString('ContractAlias'),
                        name: sqlToString(dbResults.getString('ContractName')),
                    }
                },
                _risk: new Risk({
                    id: dbResults.getLong('RiskId'),
                    probability: dbResults.getInt('RiskProbability'),
                    overallImpact: dbResults.getInt('RiskOverallImpact')
                }),
                _processesInstances: processesInstances.filter(function (item) { return item._case.id == dbResults.getLong('Id') })
            });
            result.push(item);
        }
        dbResults.close();
        stmt.close();
        return result;
    } catch (e) {
        Logger.log(JSON.stringify(e));
        throw e;
    } finally {
        conn.close();
    }
}

function addNewCase(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new Case(itemFormClient);
    try {
        var gd = new Gd(undefined);
        var caseFolder = gd.createCaseFolder(item);

        var conn = connectToSql();
        conn.setAutoCommit(false);
        item.addInDb(conn, true);
        addNewProcessInstancesForCaseInDb(item, conn);
        conn.commit();

        item.addInScrum();
        if (!item._type.isUniquePerMilestone)
            caseFolder.setName(item._displayNumber + ' ' + item.name);
        Logger.log(' item Added ItemId: ' + item.id);

        return item;
    } catch (err) {
        if (conn && conn.isValid(0)) conn.rollback();
        throw err;
    } finally {
        if (conn && conn.isValid(0)) conn.close();
    }
}

function test_editCase() {
    editCase('')
}


function editCase(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new Case(itemFormClient);
    if (item._wasChangedToUniquePerMilestone)
        item.setAsUniquePerMilestone();
    try {
        var gd = new Gd(undefined);
        var caseFolder = gd.editCaseFolder(item);
        if (caseFolder && !item._wasChangedToUniquePerMilestone) {
            item.gdFolderId = caseFolder.getId();
            item._gdFolderUrl = 'https://drive.google.com/drive/folders/' + item.gdFolderId;
        } else if (item._wasChangedToUniquePerMilestone)
            item.gdFolderId = caseFolder.getParents().next().getId();
        item._gdFolderUrl = 'https://drive.google.com/drive/folders/' + item.gdFolderId;
        var conn = connectToSql();
        item.editInDb(conn, true);
        editProcessInstancesForCaseInDb(item, conn)
        item.editInScrum();
        conn.commit();
        Logger.log('item edited ItemId: ' + item.id);
        return item;
    } catch (err) {
        Logger.log(JSON.stringify(err));
        if (conn && conn.isValid(0)) conn.rollback();
        throw err;
    } finally {
        if (conn && conn.isValid(0)) conn.close();
    }
}

function deleteCase(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    try {
        var item = new Case(itemFormClient);
        item.deleteFromDb();
        item.deleteFromScrum();
        var gd = new Gd(undefined);
        gd.deleteCaseFolder(item);
    } catch (err) {
        if (err.message.indexOf('MaterialCards_ibfk_CaseId') > 0)
            throw new Error('Nie możesz usunąć sprawy dopóki nie usuniesz wniosku materiałowego dla niej!')
        else
            throw err;
    }
}

