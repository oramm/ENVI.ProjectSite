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
        if (LettersSetup.contractsRepository.items.length === 1)
            this.modal.contractFormElement.input.simulateChosenItem(LettersSetup.contractsRepository.items[0]);
    }

    onCaseChosen(chosenItem) {
        super.onCaseChosen(chosenItem);
        this.initaliseTemplateSelectField();
    }

    onCaseUnchosen(unChosenItem) {
        this.initaliseTemplateSelectField();
    }

    initaliseTemplateSelectField() {
        const templatesForCases = MainSetup.documentTemplatesRepository.items.filter(
            template => {
                let test = false;
                for (const caseItem of this.modal.caseCollapsibleMultiSelect.value) {
                    test = !template._contents.caseTypeId || template._contents.caseTypeId === caseItem._type.id;
                    if (test) return test;
                }
                return test;
            });

        this.modal.templateSelectField.initialise(templatesForCases, '_nameContentsAlias', this.onTemplateChosen, this);
        if (templatesForCases.length === 1)
            this.modal.templateSelectField.simulateChosenItem(templatesForCases[0]);
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