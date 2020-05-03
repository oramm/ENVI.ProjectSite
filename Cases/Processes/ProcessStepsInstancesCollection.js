class ProcessStepsInstancesCollection extends SimpleCollection {
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    constructor(initParamObject) {
        super({
            id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: false,
            isDeletable: false,
            connectedRepository: ProcessesInstancesSetup.processesStepsInstancesRepository
        })
        this.status = initParamObject.status;

        this.addNewOurLetterModal = initParamObject.addNewOurLetterModal;
        this.editOurLetterModal = initParamObject.editOurLetterModal;
        this.appendLetterAttachmentsModal = initParamObject.appendLetterAttachmentsModal;

        this.initialise(this.makeList());
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeItem(dataItem) {
        return {
            id: dataItem.id,
            icon: undefined,
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            dataItem: dataItem
        };
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem) {
        return dataItem._processStep.name;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem) {
        (dataItem.description) ? true : dataItem.description = "";

        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem._processStep.description,
            dataItem,
            new InputTextField(this.id + '_' + dataItem.id + '_tmpEditDescription_TextField', 'Edytuj', undefined, true, 150),
            'description',
            this);


        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline,
            dataItem,
            new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField', 'Termin wykonania', true),
            'deadline',
            this);


        (dataItem.status) ? true : dataItem.status = "";

        var personAutoCompleteTextField = new AutoCompleteTextField(this.id + 'personAutoCompleteTextField',
            'Imię i nazwisko',
            'person',
            false,
            'Wybierz imię i nazwisko')
        personAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, "_nameSurnameEmail", this.onOwnerChosen, this);

        var personAtomicEditLabel = new AtomicEditLabel(dataItem._nameSurnameEmail,
            dataItem,
            personAutoCompleteTextField,
            'nameSurnameEmail',
            this);

        $collectionElementDescription
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append(personAtomicEditLabel.$dom);

        return $collectionElementDescription;
    }

    makeList() {
        return super.makeList().filter((item) => item.dataItem._case.id == this.parentDataItem.id);
    }

    selectTrigger(itemId) {
        super.selectTrigger(itemId);
        //wybierz letter
        var currentLetter = {};
        if (this.connectedRepository.currentItem._ourLetter)
            currentLetter = Tools.search(parseInt(this.connectedRepository.currentItem._ourLetter.id), 'id', LettersSetup.lettersRepository.items);
        LettersSetup.lettersRepository.currentItem = currentLetter;
    }

    addPlainRowCrudButtons(row) {
        super.addPlainRowCrudButtons(row)
        if (row.dataItem._processStep._documentTemplate.gdId) {
            if (row.dataItem._ourLetter) {
                this.appendLetterAttachmentsModal.preppendTriggerButtonTo(row.$crudButtons, 'Dodaj załączniki', this);
                this.editOurLetterModal.preppendTriggerButtonTo(row.$crudButtons, 'Edytuj pismo', this);
                row.$crudButtons.append(new RaisedButton('Usuń pismo', this.deleteOurLetterAction, this).$dom);
            } else
                this.addNewOurLetterModal.preppendTriggerButtonTo(row.$crudButtons, 'Generuj pismo', this);
        }
    }

    deleteOurLetterAction() {
        this.connectedRepository.currentItem._ourLetter = LettersSetup.lettersRepository.currentItem;
        this.connectedRepository.doChangeFunctionOnItem(this.connectedRepository.currentItem, 'deleteProcessStepInstanceOurLetter', this);
    }
}