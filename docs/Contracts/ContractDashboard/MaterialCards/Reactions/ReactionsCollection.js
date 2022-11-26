"use strict";
class ReactionsCollection extends SimpleCollection {
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
            isPlain: true,
            hasFilter: false,
            isEditable: false,
            isAddable: initParamObject.isAddable,
            isDeletable: true,
            connectedRepository: ReactionsSetup.reactionsRepository
        });
        this.status = initParamObject.status;
        if (this.isAddable)
            this.addNewModal = new ReactionModal(this.id + '_newReaction', 'Dodaj zadanie', this, 'ADD_NEW');
        //this.editModal = new ReactionModal(this.id + '_editReaction', 'Edytuj zadanie', this, 'EDIT');
        this.initialise(this.makeList());
    }
    /*
     * Dodano atrybut z riskId_Hidden, żeby szybciej filtorwać widok po stronie klienta zamiast przez SELECT z db
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
            riskId_Hidden: dataItem.riskId,
            status_Hidden: dataItem.status,
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
        personAutoCompleteTextField.initialise(personsRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
        var personAtomicEditLabel = new AtomicEditLabel(dataItem._nameSurnameEmail, dataItem, personAutoCompleteTextField, '_nameSurnameEmail', this);
        //var statusSelectField = new SelectField(this.id + '_' + dataItem.id + '_statusSelectField', 'Status', true);
        //statusSelectField.initialise(ReactionsSetup.statusNames);        
        //var statusAtomicEditLabel = new AtomicEditLabel(dataItem.status, 
        //                                                dataItem, 
        //                                               statusSelectField,
        //                                                'status',
        //                                                this);
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append(personAtomicEditLabel.$dom)
            .append('<span>' + dataItem.status + '<br></span>');
        return $collectionElementDescription;
    }
    makeList() {
        return super.makeList().filter((item) => item.riskId_Hidden == this.parentDataItem.id && item.status_Hidden == this.status);
    }
    selectTrigger(itemId) {
        super.selectTrigger(itemId);
        //$('#iframeRisks').attr('src','../Risks/RisksList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    }
}
