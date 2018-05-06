
class Project {
    constructor(id, name, description, value, startDate, endDate){
        this.id = id;
        this.name = name;
        this.description = description;
        this.value = value;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

function ProjectsRepository() {
  this.items = {};
  this.selectedItemId = 0;
  this.selectedItem = {};
  this.result;
}

ProjectsRepository.prototype = {
    constructor: ProjectsRepository,
    toString: function(){
      return JSON.stringify(this, null, 2);
    },
     /**
     * Calls an Apps Script function to get the data from the Google Sheet
     */
    initialise: function () {
        return new Promise((resolve, reject) => {
            this.initialiseProjectsList()
                .then(() => { this.setProjectChosenFromURL();
                              console.log("Projects initialised");
                              resolve("Projects initialised");
                            });
        });
    },
    
    
    projectChosen: function() {
        var projectId = getUrlVars()["projectId"];
    },
    
    setProjectChosenFromURL: function() {
        var projectId = getUrlVars()["projectId"];
        if (projectId!= undefined)
            this.selectedItem = Tools.search(projectId,"id", this.items);
    },
    
    initialiseProjectsList: function() {
        return new Promise((resolve, reject) => {
            // Create an execution request object.
            // Create execution request.
            var request = {
                'function': 'getProjectsListDb'
            };
            // Make the API request.
            var op = gapi.client.request({
                'root': 'https://script.googleapis.com',
                'path': 'v1/scripts/' + SCRIPT_ID + ':run',
                'method': 'POST',
                'body': request
            });

            op
              .then(resp => {  
                  this.handleInitialiseProjectsList(resp.result);
                  resolve("Projects initialised");
                  })
              .catch(err => {
                    console.error ("test 2 ", err);
              });
        });
    },
    handleInitialiseProjectsList: function (resp) {
        return new Promise((resolve, reject) => {
            if (resp.error && resp.error.status) {
                // The API encountered a problem before the script
                // started executing.
                this.result = 'Error calling API:';
                this.result += JSON.stringify(resp, null, 2);
                console.error(resp.error);
                throw this.result;
                //throw resp.error;
            } else if (resp.error) {
                // The API executed, but the script returned an error.
                // Extract the first (and only) set of error details.
                // The values of this object are the script's 'errorMessage' and
                // 'errorType', and an array of stack trace elements.
                var error = resp.error.details[0];
                this.result = 'Script error message: ' + error.errorMessage;
                console.error(resp.error);
                if (error.scriptStackTraceElements) {
                    // There may not be a stacktrace if the script didn't start
                    // executing.
                    this.result = 'Script error stacktrace:';
                    for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                        var trace = error.scriptStackTraceElements[i];
                        this.result += ('\t' + trace.function+':' + trace.lineNumber);
                    }
                throw resp.error.details[0].errorMessage;
                }
            } else {
                // The structure of the result will depend upon what the Apps
                // Script function returns. 
                var serverResponse = resp.response.result.projectsList;
                console.log(serverResponse);
                if (Object.keys(serverResponse).length == 0) {
                    this.result = 'Nie znaleziono, żadnego projektu!';
                    resolve(this.result);
                } else {
                    this.items = serverResponse;
                    projects = this.items;
                    this.result = 'ProjectsList succes';
                    resolve(this.result);
                }
            }
        });
    }
};
