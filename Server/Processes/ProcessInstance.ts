function ProcessInstance(initParamObject) {
  if(initParamObject){
    this.id = initParamObject.id;
    this.processId = initParamObject._process.id;
    
    this.caseId = initParamObject._case.id;
    this.taskId = initParamObject._task.id;
    this.editorId = initParamObject.editorId;
    
    this._lastUpdated = initParamObject._lastUpdated;
    
    this._case = initParamObject._case;
    this._task = initParamObject._task;
    this._process = initParamObject._process;
    this._stepsInstances = (initParamObject._stepsInstances)? initParamObject._stepsInstances : [];
  }
}

ProcessInstance.prototype = {
  constructor: ProcessInstance,
  
  /*
   * Jest odpalana przy każdym utworzeniu Sprawy posiadającej ProcessInstance w funkcji ProcessInstance.addInDb();
   */
  createProcessStepsInstances: function(externalConn) {
    try{
      var conn = (externalConn)? externalConn : connectToSql();
      conn.setAutoCommit(false);
      var processSteps = getProcessesStepsListForProcess(this.processId, conn);
      
      for(var i=0; i<processSteps.length; i++){
        var item = new ProcessStepInstance({ processInstanceId: this.id,
                                            processStepId: processSteps[i].id,
                                            _processStep: { id: processSteps[i].id,
                                                           name: processSteps[i].name,
                                                           description: processSteps[i].description,
                                                          },
                                            _case: this._case,
                                            editorId: this.editorId
                                           });
        
        item.addInDb(conn, true);
        this._stepsInstances.push(item);
      }
      conn.commit();
      return item.id;
    } catch (err) {
      Logger.log(JSON.stringify(err));
      if(!externalConn && conn.isValid(0)) conn.rollback();
      throw err;
    } finally {
      if(!externalConn && conn.isValid(0)) conn.close();
    }
  },
  
  addInDb: function(conn, isPartOfTransaction) {
     addInDb('ProcessInstances', this, conn, isPartOfTransaction); 
     this.createProcessStepsInstances(conn);
     return this;
  },
  
  editInDb: function(externalConn, isPartOfTransaction) {
    editInDb('ProcessInstances', this, externalConn, isPartOfTransaction);
  },
  
  deleteFromDb: function (){
    deleteFromDb ('ProcessInstances', this);
  }
}