class LettersCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: false,
            isDeletable: true,
            hasArchiveSwitch: false,
            connectedRepository: LettersSetup.lettersRepository
            //subitemsCount: 12
        });

        this.addNewIncomingLetterModal = new IncomingLetterModal(id + '_newIncomingLetterModal', 'Rejestruj pismo przychodzące', this, 'ADD_NEW');
        this.editIncomingLetterModal = new IncomingLetterModal(id + '_editIncomingLetterModal', 'Edytuj dane pisma przychodzącego', this, 'EDIT');

        this.addNewOurLetterModal = new OurLetterModal(id + '_newOurLetterModal', 'Rejestruj pismo wychodzące', this, 'ADD_NEW');
        this.editOurLetterModal = new OurLetterModal(id + '_editOurLetterModal', 'Edytuj dane pisma wychodzącego', this, 'EDIT');

        this.addNewOurOldTypeLetterModal = new OurOldTypeLetterModal(id + '_OurOldTypeLetterModal', 'Rejestruj email', this, 'ADD_NEW');
        this.editOurOldTypeLetterModal = new OurOldTypeLetterModal(id + '_editOurOldTypeLetterModal', 'Edytuj dane pisma wychodzącego po staremu', this, 'EDIT');

        this.addNewIncomingLetterModal.preppendTriggerButtonTo(this.$actionsMenu, "Rejestruj przychodzące", this);
        this.addNewOurLetterModal.preppendTriggerButtonTo(this.$actionsMenu, "Rejestruj wychodzące", this);
        this.addNewOurOldTypeLetterModal.preppendTriggerButtonTo(this.$actionsMenu, "Rejestruj email", this, 'FLAT');
        var entityRawPanel = new RawPanel({
            id: 'newEntityRawPanel',
            connectedRepository: MainSetup.entitiesRepository
        });
        entityRawPanel.initialise(new EntityModal('newEntityModal', 'Dodaj podmiot', entityRawPanel, 'ADD_NEW'), 'FLAT');
        this.$actionsMenu.append(entityRawPanel.$dom);
        this.appendLetterAttachmentsModal = new AppendLetterAttachmentsModal(id + '_appendLetterAttachmentsModal', 'Dodaj załączniki', this, 'EDIT');
        this.initialise(this.makeCollapsibleItemsList());

    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem) {
        let item = super.makeItem(dataItem);
        let editModal;
        if (dataItem.isOur) {
            if (dataItem.number == dataItem.id)
                editModal = this.editOurLetterModal;
            else
                editModal = this.editOurOldTypeLetterModal;
        } else
            editModal = this.editIncomingLetterModal;

        var name = '';
        name += '<strong>' + dataItem.creationDate + '</strong> ' + dataItem.description + '<Br>';

        name += 'Numer&nbsp;<strong>' + dataItem.number + '</strong>, ';
        name += (dataItem.isOur) ? 'Nadano:&nbsp;' : 'Otrzymano:&nbsp;';
        name += '<strong>' + dataItem.registrationDate + '</strong>, ';
        name += (dataItem.isOur) ? 'Odbiorca:&nbsp;' : 'Nadawca:&nbsp;';
        name += this.makeEntitiesLabel(dataItem._entitiesMain)

        item.name = name;
        item.editModal = editModal;
        return item;
    }

    makeEntitiesLabel(entities) {
        var label = '';
        for (var i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + ', '
        }
        if (entities[i])
            label += entities[i].name;
        return label;
    }

    makeBody(dataItem) {
        var $actionButtons = $('<div class="row">')
        //if (dataItem._canUserChangeFileOrFolder)
        this.appendLetterAttachmentsModal.preppendTriggerButtonTo($actionButtons, 'Dodaj załączniki', this);

        var $casesUl = $('<ul class="collection">');
        this.createCasesList(dataItem, $casesUl);
        var timestamp = (dataItem._lastUpdated) ? Tools.timestampToString(dataItem._lastUpdated) : '[czas wyświetli po odświeżeniu]'
        var $panel = $('<div>')
            .attr('id', 'collapsibleBody' + dataItem.id)
            .attr('letterId', dataItem.id)
            .append($actionButtons)
            .append($('<strong>Dotyczy spraw:</stron>'))
            .append($casesUl)
            .append($('<span class="comment">Ostania zmiana: ' + timestamp + ' ' +
                'przez&nbsp;' + dataItem._editor.name + '&nbsp;' + dataItem._editor.surname + '</span>'));

        return {
            collection: undefined,
            $dom: $panel
        };
    }

    createCasesList(dataItem, $casesUl) {
        for (var i = 0; i < dataItem._cases.length; i++) {
            var $caseLi = $('<li class="collection-item">');
            var caseLabel;
            if (dataItem._cases[i]._parent._parent.ourId)
                caseLabel = dataItem._cases[i]._parent._parent.ourId;
            else
                caseLabel = dataItem._cases[i]._parent._parent.number;
            caseLabel += ', ' + dataItem._cases[i]._parent._type._folderNumber + ' ' +
                dataItem._cases[i]._parent._type.name +
                ' | ';
            caseLabel += dataItem._cases[i]._typeFolderNumber_TypeName_Number_Name;
            $caseLi.html(caseLabel);
            $casesUl.append($caseLi);
        }
    }
}