function LetterEntity(initParamObject) {
    if(initParamObject){
      this.letterId = initParamObject._letter.id;
      this._letter = initParamObject._letter;
  
      this.entityId = initParamObject._entity.id;
      this._entity = initParamObject._entity;
  
      this.letterRole = initParamObject.letterRole;
      //id jest usuwane w addInDb(), więc przy asocjacjach musi byś ręcznie odtworeone w controllerze
      this.id = '' + this.letterId + this.entityId;
      Logger.log('this is: ' + this.id);
    }
  }
  
LetterEntity.prototype = {
    constructor: LetterEntity,
    
    addInDb: function(externalConn, isPartOfTransaction) {
      var conn = (externalConn)? externalConn : connectToSql();
      addInDb('Letters_Entities', this, externalConn, isPartOfTransaction);
    }
  }