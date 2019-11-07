function Entity(initParamObject){
  if(initParamObject){
    this.id = initParamObject.id;
    if (initParamObject.name) this.name = initParamObject.name.trim();
    this.address = initParamObject.address;
    this.taxNumber = initParamObject.taxNumber;
    this.www = initParamObject.www;
    this.email = initParamObject.email;
    this.phone = initParamObject.phone;
    this.fax = initParamObject.fax;
    
  }
}

Entity.prototype = {
  constructor: Entity,
  
  addInDb: function(conn, isPartOfTransaction) {
     return addInDb('Entities', this, conn, isPartOfTransaction);
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('Entities', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('Entities', this, undefined, undefined);
  }
}

