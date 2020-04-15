function getRisksListPerProject(initParamObject) {
  var projectCondition = (initParamObject && initParamObject.projectOurId) ? 'Risks.ProjectOurId="' + prepareValueToSql(initParamObject.projectOurId) + '"' : '1';
  var sql = 'SELECT Risks.Id, \n \t' +
    'Risks.Name, \n \t' +
    'Risks.Cause, \n \t' +
    'Risks.ScheduleImpactDescription, \n \t' +
    'Risks.CostImpactDescription, \n \t' +
    'Risks.Probability, \n \t' +
    'Risks.OverallImpact, \n \t' +
    'OverallImpact*Probability AS Rate, \n \t' +
    'Risks.AdditionalActionsDescription, \n \t' +
    'Risks.CaseId, \n \t' +
    'Risks.ProjectOurId, \n \t' +
    'Risks.LastUpdated, \n \t' +
    'Cases.Id AS CaseId, \n \t' +
    'Cases.Name AS CaseName, \n \t' +
    'Cases.GdFolderId AS CaseGdFolderId, \n \t' +
    'CaseTypes.name AS CaseTypeName, \n \t' +
    'CaseTypes.FolderNumber AS CaseTypeFolderNumber, \n \t' +
    'Milestones.Id AS MilestoneId, \n \t' +
    'Milestones.Name AS MilestoneName, \n \t' +
    'Milestones.GdFolderId AS MilestoneGdFolderId, \n \t' +
    'MilestoneTypes.Id AS MilestoneTypeId, \n \t' +
    'MilestoneTypes_ContractTypes.FolderNumber AS MilestoneFolderNumber, \n \t' +
    'MilestoneTypes.Name AS MilestoneTypeName, \n \t' +
    'OurContractsData.OurId AS ContractOurId, \n \t' +
    'Contracts.Id AS ContractId, \n \t' +
    'Contracts.Number AS ContractNumber, \n \t' +
    'Contracts.Name AS ContractName \n' +
    'FROM Risks \n' +
    'JOIN Cases ON Risks.CaseId=Cases.Id \n' +
    'JOIN CaseTypes ON CaseTypes.Id=Cases.TypeId \n' +
    'JOIN Milestones ON Milestones.Id=Cases.MilestoneId \n' +
    'JOIN MilestoneTypes ON MilestoneTypes.Id=Milestones.TypeId \n' +
    'JOIN Contracts ON Milestones.ContractId = Contracts.Id \n' +
    'LEFT JOIN OurContractsData ON Milestones.ContractId = OurContractsData.Id \n' +
    'JOIN MilestoneTypes_ContractTypes ON MilestoneTypes_ContractTypes.MilestoneTypeId=MilestoneTypes.Id AND MilestoneTypes_ContractTypes.ContractTypeId=Contracts.TypeId\n' +
    //'LEFT JOIN Persons ON Persons.Id = Tasks.OwnerId';
    'WHERE ' + projectCondition;
  return getRisks(sql);
}

function getRisks(sql) {
  var result = [];
  Logger.log(sql);
  var conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);

    while (dbResults.next()) {
      var item = new Risk({
        id: dbResults.getLong('Id'),
        name: dbResults.getString('Name'),
        cause: dbResults.getString('Cause'),
        scheduleImpactDescription: dbResults.getString('ScheduleImpactDescription'),
        costImpactDescription: dbResults.getString('CostImpactDescription'),
        probability: dbResults.getInt('Probability'),
        overallImpact: dbResults.getInt('OverallImpact'),
        rate: dbResults.getInt('Rate'),
        additionalActionsDescription: dbResults.getString('AdditionalActionsDescription'),
        caseId: dbResults.getLong('CaseId'),
        projectOurId: dbResults.getString('ProjectOurId'),
        lastUpdated: dbResults.getString('LastUpdated'),
        _case: {
          id: dbResults.getLong('CaseId'),
          name: dbResults.getString('CaseName'),
          gdFolderId: dbResults.getString('CaseGdFolderId'),
          _type: {
            name: dbResults.getString('CaseTypeName'),
            folderNumber: dbResults.getString('CaseTypeFolderNumber')
          }
        },
        //parentem jest Milestone
        _parent: {
          id: dbResults.getLong('MilestoneId'),
          name: dbResults.getString('MilestoneName'),
          gdFolderId: dbResults.getString('MilestoneGdFolderId'),
          _folderNumber: dbResults.getString('MilestoneFolderNumber'),
          _type: {
            id: dbResults.getInt('MilestoneTypeId'),
            //folderNumber: dbResults.getString(22),
            name: dbResults.getString('MilestoneTypeName')
          },
          _parent: {
            ourIdNumberName: dbResults.getString('ContractOurId') + ' ' + dbResults.getString('ContractNumber') + ' ' + dbResults.getString('ContractName'),
            id: dbResults.getLong('ContractId')
          }
        }
      });
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

function TEST_getRisksListPerProject() {
  getRisksListPerProject({projectOurId: "kob.gws.01.wlasne"})
}

function addNewRisk(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Risk(itemFormClient);
  var conn = connectToSql();
  try {
    item.addInDb(conn);
    //item.addInScrum(conn);
    conn.commit();
    return item;
  } catch (err) {
    conn.rollback();
    throw err;
  } finally {
    conn.close();
  }
}

function test_addNewRisk() {
  addNewRisk('{"_parent":{"endDate":"2019-05-27","_gdFolderUrl":"https://drive.google.com/drive/folders/1GwFwxGih1kgCwQnIv-rYvQaA6Wj7zAr6","description":"","gdFolderId":"1GwFwxGih1kgCwQnIv-rYvQaA6Wj7zAr6","_relatedContract":{"_numberName":"","projectId":"KOB.GWS.01.WLASNE"},"_parent":{"_ourContract":{},"_admin":{"id":152},"ourId":"KOB.IK.01","_manager":{"id":152},"id":114,"projectId":"KOB.GWS.01.WLASNE"},"id":398,"_type":{"isInScrumByDefault":true,"isUniquePerContract":true,"isDefault":true,"folderNumber":"01","contractType":"","name":"Administracja","id":1},"_nameTypeFolderNumberName":"01 Administracja | ","name":"","_folderName":"01 Administracja","contractId":114,"typeId":1,"startDate":"2019-05-06","status":"Nie rozpoczęty"},"_case":{"_gdFolderUrl":"https://drive.google.com/drive/folders/1M7UFqexpmbBT9f68I7AxmGbXZ9OAK8QM","milestoneId":398,"_type":{"isDefault":true,"isUniquePerMilestone":false,"folderNumber":"01","name":"Sprawy ogólne","id":"45","milestoneTypeId":1},"description":"","gdFolderId":"1M7UFqexpmbBT9f68I7AxmGbXZ9OAK8QM","_nameTypeFolderNumberName":"01 Sprawy ogólne | test","_parent":{"contractId":114,"id":398,"gdFolderId":"1GwFwxGih1kgCwQnIv-rYvQaA6Wj7zAr6"},"name":"test","typeId":"45","id":14},"cause":"","scheduleImpactDescription":"","costImpactDescription":"","probability":"3","overallImpact":"1","additionalActionsDescription":"","id":"1_pending"}')
}

function editRisk(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Risk(itemFormClient);

  item.editInDb();
  Logger.log('item edited ItemId: ' + item.id);
  return item;
}

function test_editRisk() {
  editRisk('{"overallImpact":2,"probability":2,"_lastUpdated":"2018-11-24 15:41:17.0","_contract":{"id":7,"ourIdNumberName":"WRO.SW.01 do uzupełnienia do uzupełnienia"},"_rate":"M","_milestone":{"endDate":"2017-01-06","description":"","name":"przeprowadzenie analizy dokumentacji środowiskowej ","contractId":"7","id":7,"projectName":"Drobne zlecenia nie należące do żadnego większego projektu","projectId":"ROZNE.ENVI.00","startDate":"1970-01-01","status":"Zrobione"},"name":"Nazwa test","_smallRateLimit":4,"id":20,"projectId":"ROZNE.ENVI.00","_bigRateLimit":12,"cause":"","scheduleImpactDescription":"","costImpactDescription":"","additionalActionsDescription":""}')
}

function deleteRisk(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new Risk({ id: itemFormClient.id });
  Logger.log(JSON.stringify(item));
  item.deleteFromDb();
  //item.deleteFromScrum()
}

function test_deleteRisk(itemFormClient?) {
  var item = new Risk({ id: itemFormClient.id });
  Logger.log(JSON.stringify(item));
  item.deleteFromDb();
}

