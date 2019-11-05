function getInventoryList() {
  var sql = 'SELECT * FROM Inventory';
  //Logger.log(sql);
  return getInventory(sql);
}

function getInventory(sql) {
  var result = [];
  var conn = connectToSql();
  var stmt = conn.createStatement();
  try {
    var dbResults = stmt.executeQuery(sql);
    
    while (dbResults.next()) {
      //Id 	LicensePlateNumber 	Name 	Description 	Type 	Status 	LastUpdated 
      var item = new InventoryItem({id: dbResults.getLong(1),
                                    licensePlateNumber: dbResults.getString(2),
                                    name: dbResults.getString(3),
                                    description: dbResults.getString(4),
                                    type: dbResults.getString(5),
                                    status: dbResults.getString(6),
                                    _lastUpdated: dbResults.getString(7)
                                   });
      delete item._statuses;
      delete item._types;
      result.push(item);
    }
    return result;
  } catch (e) {
    throw e;
  } finally {
    conn.close();
  }  
}

function addNewInventoryItem(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new InventoryItem(itemFormClient);
    
    try{
      var conn = connectToSql();
      var newId = item.addInDb(conn);
      //item.addInScrum(conn);
      return item.id;
    } catch (err) {
      throw err;
    } finally {
      conn.close();
    } 
    Logger.log(' item Added ItemId: ' + item.id);
    return newId;
}

function editInventoryItem(itemFormClient) {
    itemFormClient = JSON.parse(itemFormClient);
    var item = new InventoryItem(itemFormClient);
    item.editInDb();
    Logger.log('item edited ItemId: ' + item.id);
}

function test_editInventoryItem(){
  editInventoryItem('{"description":"","type":"Pojazd","_lastUpdated":"2019-01-10 22:33:05.0","licensePlateNumber":"OB 89134","name":"Audi A3","id":"3","status":"Wymagany serwis"}')
}

function deleteInventoryItem(itemFormClient){
  itemFormClient = JSON.parse(itemFormClient);
  var item = new InventoryItem(itemFormClient);
  item.deleteFromDb();
}

function test_deleteInventoryItem(){
  var item = new InventoryItem();
  item.id = 3;
  Logger.log(JSON.stringify(item));
  item.deleteFromDb();
}

