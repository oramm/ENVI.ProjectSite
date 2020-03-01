class ProcessAppendLetterAttachmentsModal extends AppendLetterAttachmentsModal {
    constructor(id, tittle, connectedResultsetComponent) {
        super(id, tittle, connectedResultsetComponent, LettersSetup.lettersRepository);
        this.forceEditBehavior = true;
        this.doChangeFunctionOnItemName = 'appendProcessStepInstanceOurLetterAttachments';
    }

};
