class Tools{
   //finds an alament in Array by its value
    static search(nameKey, property, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i][property] === nameKey) {
                return myArray[i];
            }
        }
    }
    
    static loadjscssfile(filename, filetype){
        if (filetype=="js"){ //if filename is a external JavaScript file
            var fileref = document.createElement('script')
            fileref.setAttribute("type","text/javascript")
            fileref.setAttribute("src", filename)
        }
        else if (filetype == "css"){ //if filename is an external CSS file
            var fileref=document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", filename)
        }
        if (typeof fileref!="undefined")
            document.getElementsByTagName("head")[0].appendChild(fileref)
       }
    
    //retrieves GET variables from URL
    static getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, 
                                                 function(m,key,value) {
                                                    vars[key] = value;
                                                });
        return vars;
    }
    
    static hasFunction(functionRef) {
        if (typeof functionRef === 'undefined') {
            throw new SyntaxError('Derived object must implement function');
        } else if (typeof functionRef !== 'function') {
            throw new SyntaxError("It's neither undefined nor a function. It's a " + typeof functionRef);
        }
    }
}

//finds an alament in Array by its value
function search(nameKey, property, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i][property] === nameKey) {
            return myArray[i];
        }
    }
}
//retrieves GET variables from URL
function getUrlVars() {
var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
vars[key] = value;
});
return vars;
}



$.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };