function LetterCase(initParamObject) {
    if(initParamObject){
      this.letterId = initParamObject._letter.id;
      this.caseId = initParamObject._case.id;
      //id jest usuwane w addInDb(), więc przy asocjacjach musi byś ręcznie odtworeone w controllerze
      this.id = '' + this.letterId + this.caseId;
      Logger.log('this is: ' + this.id)
      this._letter = initParamObject._letter;
      this._case = initParamObject._case;
    }
  }
  
  
  LetterCase.prototype = {
    constructor: LetterCase,
    
    addInDb: function(externalConn, isPartOfTransaction) {
      var conn = (externalConn)? externalConn : connectToSql();
      addInDb('Letters_Cases', this, externalConn, isPartOfTransaction);
    }
  }