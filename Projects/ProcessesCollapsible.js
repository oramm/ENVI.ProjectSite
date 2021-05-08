class ProcessesCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            hasArchiveSwitch: false,
            connectedRepository: CasesSetup.casesRepository,
            connectedRepositoryGetRoute: `cases/?projectId=${MainSetup.currentProject.ourId}`,
            title: 'Aktualne procesy'
            //subitemsCount: 12
        });

        this.editProcessStepInstanceModal = new ProcessStepsInstancesModal(this.id + '_editProcessStepInstance', 'Edytuj krok w procesie', this, 'EDIT');
        this.addNewOurLetterModal = new ProcessOurLetterModal(id + '_newOurLetterModal', 'Rejestruj pismo wychodzące', this, 'ADD_NEW');
        this.editOurLetterModal = new ProcessOurLetterModal(id + '_editOurLetterModal', 'Edytuj dane pisma wychodzącego', this, 'EDIT');
        this.appendLetterAttachmentsModal = new ProcessAppendLetterAttachmentsModal(id + '_appendLetterAttachmentsModal', 'Dodaj załączniki', this, 'EDIT');

        var filterElements = [
            {
                serverSideReload: true,
                inputType: 'FilterSwitchInput',
                colSpan: 6,
                onLabel: 'Z Procesem',
                offLabel: 'Bez procesu',
                attributeToCheck: 'hasProcesses'
            }
        ]
        this.initialise(this.makeCollapsibleItemsList(), filterElements);
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem) {
        let item = super.makeItem(dataItem);
        dataItem.hasProcesses = dataItem._processesInstances.length > 0;
        var contractNumber = (dataItem._parent._parent.ourId) ? dataItem._parent._parent.ourId : dataItem._parent._parent.number;
        var contractAlias = (dataItem._parent._parent.alias) ? dataItem._parent._parent.alias : '';

        item.name = '<strong>' + contractNumber + '</strong> ' + contractAlias + ' >> ' + dataItem._typeFolderNumber_TypeName_Number_Name
        return item;
    }

    makeBody(dataItem) {
        let $descriptionLabel = $((dataItem.description) ? '<BR>' + dataItem.description : '');
        let subCollection = new ProcessStepsInstancesCollection({
            id: 'processStepsCollection_' + dataItem.id,
            title: "",
            editModal: this.editProcessStepInstanceModal,
            addNewOurLetterModal: this.addNewOurLetterModal,
            editOurLetterModal: this.editOurLetterModal,
            appendLetterAttachmentsModal: this.appendLetterAttachmentsModal,
            parentDataItem: dataItem,
            connectedResultsetComponent: this
        });
        let $panel = $('<div>')
            .attr('id', 'collapsibleBodyForProcess' + dataItem.id)
            .attr('processId', dataItem.id)
            .append($descriptionLabel)
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    }
    makeList() {
        return super.makeList().filter((item) => item.dataItem.caseId == this.parentDataItem.id && item.dataItem.status == this.status);
    }
}