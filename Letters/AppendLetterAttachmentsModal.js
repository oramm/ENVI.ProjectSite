class AppendLetterAttachmentsModal extends Modal {
    constructor(id, title, connectedResultsetComponent) {
        super(id, title, connectedResultsetComponent, 'EDIT');
        //this.controller = new AppendLetterAttachmentsModalController(this);
        this.doChangeFunctionOnItemName = 'appendLetterAttachments';
    
        this.initFormElements();

        this.formElements = [
            this.fileFormElement
        ];
        this.initialise();
    }
    /*
     * uruchamiana po konstruktorze, przed jej wywołąniem musi być ustawiony controller
     */
    initFormElements() {
        this.letterFileInput = new FileInput(this.id + '_letter_FileInput', 'Wybierz pliki', this, true);

        var _this = this;

        
        this.fileFormElement = {
            input: this.letterFileInput,
            description: '',
            dataItemKeyName: '_blobEnviObjects',
            refreshDataSet() {
                //_this.controller.initFileInput();
            }
        };
    }
};
