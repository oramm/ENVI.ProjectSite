function IncomingLetter(initParamObject) {
    Letter.call(this, initParamObject); // http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
    this._super = Letter.prototype;
    this.isOur = false;
    this.number = initParamObject.number;

}
Tools.inheritPrototype(IncomingLetter, Letter);

IncomingLetter.prototype = {
    constructor: IncomingLetter,
    canUserChangeFileOrFolder: function(){
        this._super.canUserChangeFileOrFolder.call(this);
        Logger.log('executed IncomingLetter: canUserChangeFileOrFolder()');
    }
}

function test_submethods(){
    var x = new IncomingLetter({_project:{}
                               });
    x.canUserChangeFileOrFolder();
  }