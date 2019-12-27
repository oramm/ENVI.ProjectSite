function getMaterialCardsVersionsListPerContract(contractId: number): MaterialCardVersion[] {
  var contractConditon = (contractId) ? 'MaterialCards.ContractId="' + contractId + '"' : '1';

  var sql = 'SELECT MaterialCardVersions.Id, \n \t' +
    'MaterialCardVersions.Status, \n \t' +
    'MaterialCardVersions.ParentId, \n \t' +
    'MaterialCards.LastUpdated, \n \t' +
    'Editors.Id AS EditorId, \n \t' +
    'Editors.Name AS EditorName, \n \t' +
    'Editors.Surname AS EditorSurname, \n \t' +
    'Editors.Email AS EditorEmail \n' +
    'FROM MaterialCardVersions \n' +
    'JOIN Persons AS Editors ON Editors.Id=MaterialCardVersions.EditorId \n' +
    'WHERE ' + contractConditon + '\n' +
    'ORDER BY MaterialCardVersions.Id DESC';
  Logger.log(sql);
  return getMaterialCardVersions(sql, {contractId: contractId});
}
function test_getMaterialCardVersionsListPerContract() {
  getMaterialCardsVersionsListPerContract(361)
}

function getMaterialCardVersions(sql, initParamObject): MaterialCardVersion[] {
  var result = [];
  var conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    
    var dbResults = stmt.executeQuery(sql);
    while (dbResults.next()) {
      var item = new MaterialCardVersion({
        id: dbResults.getLong('Id'),
        status: dbResults.getString('Status'),
        lastUpdated: dbResults.getString('LastUpdated'),
        parentId: dbResults.getInt('ParentId'),
        //ostatni edytujący
        _editor: {
          id: dbResults.getLong('EditorId'),
          name: dbResults.getString('EditorName'),
          surname: dbResults.getString('EditorSurname'),
          email: dbResults.getString('EditorEmail')
        },
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

function deleteMaterialCardVersion(itemFormClient) {
  itemFormClient = JSON.parse(itemFormClient);
  var item = new MaterialCardVersion(itemFormClient);
  item.deleteFromDb();

}
