function PersonsRepository() {
  this.items = {};
  this.selectedItem = {};
  this.result;
}

PersonsRepository.prototype = {
    constructor: PersonsRepository,
    toString: function(){
      return JSON.stringify(this, null, 2);
    },
    initialise: function() {
        return new Promise((resolve, reject) => {
            // Create an execution request object.
            var request = {
                'function': 'getData'
            };
            // Make the API request.
            var op = gapi.client.request({
                'root': 'https://script.googleapis.com',
                'path': 'v1/scripts/' + SCRIPT_ID + ':run',
                'method': 'POST',
                'body': request
            });
            var _this = this;
            var x;
            op.execute(function(resp){ 
                _this.personsHandleGetDataResponse(resp);
                resolve(_this.result);
            });
        })
    },
    personsHandleGetDataResponse: function(resp) {
        return new Promise((resolve, reject) => {
            if (resp.error && resp.error.status) {
                // The API encountered a problem before the script
                // started executing.
                this.result = 'Error calling API: /n';
                this.result += JSON.stringify(resp, null, 2);
            } else if (resp.error) {
                // The API executed, but the script returned an error.
                // Extract the first (and only) set of error details.
                // The values of this object are the script's 'errorMessage' and
                // 'errorType', and an array of stack trace elements.
                var error = resp.error.details[0];
                this.result = 'Script error message: ' + error.errorMessage;
                if (error.scriptStackTraceElements) {
                    // There may not be a stacktrace if the script didn't start
                    // executing.
                    this.result = 'Script error stacktrace:';
                    for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                        var trace = error.scriptStackTraceElements[i];
                        this.result += ('\t' + trace.function+':' + trace.lineNumber);
                    reject(this.result);
                    }
                }
            } else {
                // The structure of the result will depend upon what the Apps
                // Script function returns. 

                var personsRes = resp.response.result.persons;
                console.log(personsRes);
                if (Object.keys(personsRes).length == 0) {
                    this.result = 'Nie znaleziono, żadnej osoby!';
                    resolve(this.result);
                } else {
                    //Object.keys(personsRes).forEach(function(id) {
                    resolve(this.result);
                    this.items = personsRes;
                    persons = this.items;
                    this.result = 'succes';
                }
            }
        })
    }
};
