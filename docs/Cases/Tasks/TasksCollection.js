"use strict";
class TasksCollection extends SimpleCollection {
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    constructor(initParamObject) {
        super({ id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: initParamObject.isAddable,
            isDeletable: true,
            connectedRepository: TasksSetup.tasksRepository
        });
        this.status = initParamObject.status;
        this.initialise(this.makeList());
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeItem(dataItem) {
        //potrzebne sprawdzenie i ew. podmiana na '', żeby nie wyświetlać takstu 'undefined'
        (dataItem._nameSurnameEmail) ? true : dataItem._nameSurnameEmail = "";
        var nameSurnameEmailLabel = (dataItem._nameSurnameEmail) ? (dataItem._nameSurnameEmail) + '<BR>' : "";
        return { id: dataItem.id,
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
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpEditDescription_TextField', 'Edytuj', undefined, true, 150), 'description', this);
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, dataItem, new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField', 'Termin wykonania', true), 'deadline', this);
        (dataItem.status) ? true : dataItem.status = "";
        var personAutoCompleteTextField = new AutoCompleteTextField(this.id + 'personAutoCompleteTextField', 'Imię i nazwisko', 'person', false, 'Wybierz imię i nazwisko');
        personAutoCompleteTextField.initialise(MainSetup.personsEnviRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
        var personAtomicEditLabel = new AtomicEditLabel(dataItem._nameSurnameEmail, dataItem, personAutoCompleteTextField, '_nameSurnameEmail', this);
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append(personAtomicEditLabel.$dom);
        //.append('<span>' + dataItem.status + '<br></span>');
        return $collectionElementDescription;
    }
    makeList() {
        return super.makeList().filter((item) => item.dataItem.caseId == this.parentDataItem.id && item.dataItem.status == this.status);
    }
    selectTrigger(itemId) {
        super.selectTrigger(itemId);
        //$('#contractDashboard').attr('src','../Cases/CasesList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    }
}
