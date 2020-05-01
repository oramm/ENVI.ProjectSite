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
    }
    
    onTemplateChosen(chosenItem) {
        if (chosenItem && chosenItem !== this.modal.templateFormElement.defaultDisabledOption) {
            MainSetup.documentTemplatesRepository.currentItem = chosenItem;
        }
        else {
            MainSetup.documentTemplatesRepository.currentItem = {};
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