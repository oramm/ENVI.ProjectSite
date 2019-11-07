class OurLetter extends LetterNew {
    constructor(initParamObject){
        super(initParamObject);
        this.editorId = this.setEditorId();
        if (this.letterFilesCount) 
            this._folderName = this.makeFolderName();
        
            this._canUserChangeFileOrFolder = this.canUserChangeFileOrFolder();
        
    }
}