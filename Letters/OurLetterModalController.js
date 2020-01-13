class OurLetterModalController extends LetterModalController {
    constructor(modal) {
        super(modal);
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler() {
        super.initAddNewDataHandler();
        LettersSetup.lettersRepository.currentItem.isOur = true;
        this.modal.form.fillWithData({
            creationDate: Tools.dateJStoDMY(new Date()),
            registrationDate: Tools.dateJStoDMY(new Date())
        });
    }
    
    onTemplateChosen(chosenItem) {
        if (chosenItem && chosenItem !== this.modal.templateFormElement.defaultDisabledOption) {
            LettersSetup.documentTemplatesRepository.currentItem = chosenItem;
        }
        else {
            LettersSetup.documentTemplatesRepository.currentItem = {};
        }
    }

    initFileInput() {
        this.modal.fileFormElement.input.isRequired = false;
        this.modal.form.setElementDescription(this.setFileInputDescription(), this.modal.fileFormElement);
    }

    setFileInputDescription() {
        var description = '';
        description = 'Wybierz załączniki. ';
        description += 'Aby wybrać kilka plików klikaj w nie trzymając cały czas wciśnięty klaiwsz [CTRL]. <br>';
        if (this.modal.mode == 'EDIT')
            description += 'Jeżeli nie chcesz zmieniać załączników, zignoruj to pole';

        return description;
    }
};