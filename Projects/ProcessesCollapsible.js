class ProcessesCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            hasArchiveSwitch: true,
            connectedRepository: CasesSetup.casesRepository
            //subitemsCount: 12
        });

        this.editProcessStepInstanceModal = new ProcessStepsInstancesModal(this.id + '_editProcessStepInstance', 'Edytuj krok w procesie', this, 'EDIT');
        this.addNewOurLetterModal = new ProcessOurLetterModal(id + '_newOurLetterModal', 'Rejestruj pismo wychodzące', this, 'ADD_NEW');
        this.editOurLetterModal = new ProcessOurLetterModal(id + '_editOurLetterModal', 'Edytuj dane pisma wychodzącego', this, 'EDIT');
        this.appendLetterAttachmentsModal = new ProcessAppendLetterAttachmentsModal(id + '_appendLetterAttachmentsModal', 'Dodaj załączniki', this, 'EDIT');

        this.initialise(this.makeCollapsibleItemsList());

        this.filter.addInput({
            input: this.filter.createFilterInputField(this.id + "-filter11", this.$dom.find('li')),
            colSpan: 4
        })
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom) {
        return {
            id: dataItem.id,
            name: dataItem.number + ' ' + dataItem.name + ' >> typ sprawy: ' + dataItem._type.name,
            $body: $bodyDom,
            dataItem: dataItem,
            editModal: this.editModal
        };
    }

    makeBodyDom(dataItem) {
        var $descriptionLabel = $((dataItem.description) ? '<BR>' + dataItem.description : '');

        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForProcess' + dataItem.id)
            .attr('processId', dataItem.id)
            .append($descriptionLabel)
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append(new ProcessStepsInstancesCollection({
                id: 'processStepsCollection_' + dataItem.id,
                title: "",
                editModal: this.editProcessStepInstanceModal,
                addNewOurLetterModal: this.addNewOurLetterModal,
                editOurLetterModal: this.editOurLetterModal,
                appendLetterAttachmentsModal: this.appendLetterAttachmentsModal,
                parentDataItem: dataItem,
                connectedResultsetComponent: this
            }).$dom);
        return $panel;
    }
    makeList(){
        return super.makeList().filter((item)=>item.dataItem.caseId==this.parentDataItem.id && item.dataItem.status == this.status );
    }
}