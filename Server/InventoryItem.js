function InventoryItem(initParamObject) {
  this._types = [{id: 'CAR', name:'Pojazd'},
                {id: 'COMPUTER', name: 'Komputer'}, 
                {id: 'PRINTER', name: 'Drukarka'},      
                {id: 'OTHER', name: 'Pozostałe'}
               ];
  this._statuses = [{id: 'AVAILABLE', name:'Dostępny'},
                   {id: 'SERVICE_REQUIRED1', name: 'Wymagany serwis'}, 
                   {id: 'IN_SERVICE', name: 'W naprawie'},      
                   {id: 'DISABLED', name: 'Nie działa'}
                  ];
  if(initParamObject)
    this.id = initParamObject.id;
    this.licensePlateNumber = initParamObject.licensePlateNumber;
    this.name = initParamObject.name;
    this.description = initParamObject.description;
    this.type = this.getTypeNameById(initParamObject.type) || this.getTypeIdByName(initParamObject.type);
    this.status = this.getStatusNameById(initParamObject.status) || this.getStatusIdByName(initParamObject.status);
    this._lastUpdated = initParamObject._lastUpdated;    
}

InventoryItem.prototype = {
  constructor: InventoryItem,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('Inventory', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('Inventory', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('Inventory', this);
  },
  
  getStatusNameById: function(id){
    var result = this._statuses.filter(function(item){ return item.id==id})[0];
    if(result) return result.name;
  },
    
  getStatusIdByName: function(name){
    var result = this._statuses.filter(function(item){ return item.name==name})[0]
    if(result) return result.id;
  },
    
  getTypeNameById: function(id){
    var result = this._types.filter(function(item){ return item.id==id})[0];
    if(result) return result.name;
  },
    
  getTypeIdByName: function(name){
    var result = this._types.filter(function(item){ return item.name==name})[0];
    if(result) return result.id;
  }
}