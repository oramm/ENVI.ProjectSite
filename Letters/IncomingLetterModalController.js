class IncomingLetterModalController extends LetterModalController {
    constructor(modal) {
        super(modal);
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler() {
        super.initAddNewDataHandler();
        this.modal.connectedResultsetComponent.connectedRepository.currentItem.isOur = false;
    }
    /*
     * ustawia stan po otwarciu okna
     */
    initNumberInput() {
        this.modal.numberFormElement.input.setValue('');
    }

    initFileInput() {
        this.modal.fileFormElement.input.isRequired = this.modal.mode === 'ADD_NEW';
        this.modal.form.setElementDescription(this.setFileInputDescription(), this.modal.fileFormElement);
    }

    setFileInputDescription() {
        var description = '';
        if (this.modal.mode === 'EDIT' && !LettersSetup.lettersRepository.currentItem._canUserChangeFileOrFolder) {
            this.modal.fileFormElement.input.$dom.hide();
            description = 'Nie masz uprawnień do zmiany plików tego pisma. Może to zrobić tylko: ' + LettersSetup.lettersRepository.currentItem._fileOrFolderOwnerEmail;
        } else if (LettersSetup.lettersRepository.currentItem._canUserChangeFileOrFolder) {
            this.modal.fileFormElement.input.$dom.show();
            description = 'Wybierz plik pisma i ew. załączniki. ';
            description += 'Aby wybrać kilka plików klikaj w nie trzymając cały czas wciśnięty klaiwsz [CTRL]. <br>';
            if (this.modal.mode == 'EDIT')
                description += 'Jeżeli edytujesz pismo i nie chcesz zmieniać załącznika, zignoruj to pole';
        }
        return description;
    }
};