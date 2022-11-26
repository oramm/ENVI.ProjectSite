"use strict";
class CurrentMilestonesCollection extends SimpleCollection {
    constructor(initParamObject) {
        super({ id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: false,
            isDeletable: true,
            connectedRepository: milestonesRepository
        });
        //this.addNewModal = new NewMilestoneModal(this.id + '_newMilestone', 'Dodaj kamień', this);
        this.editModal = new CurrentMilestoneModal(this.id + '_editMilestone', 'Edytuj kamień milowy', this, 'EDIT');
        this.initialise(this.makeList());
    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
     * @dataItem connectedRepository.items[i]
     */
    makeItem(dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        return { id: dataItem.id,
            //icon:   'info',
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            editUrl: dataItem.editUrl,
            contractId_Hidden: dataItem.contractId,
            dataItem: dataItem
        };
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem) {
        var typeName = (dataItem._type.name) ? dataItem._type.name + ' ' : '';
        var titleAtomicEditLabel = new AtomicEditLabel(typeName + dataItem.name, dataItem, { input: new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150),
            dataItemKeyName: 'name'
        }, 'name', this);
        return titleAtomicEditLabel.$dom;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        //TODO: kiedyś dodać edyzcję dat
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, dataItem, new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField', 'Termin wykonania', true), 'deadline', this);
        (dataItem.status) ? true : dataItem.status = "";
        $collectionElementDescription
            .append('<span>Projekt: ' + dataItem.projectId + ' => </span>')
            .append('<span>Kontrakt: <strong>' + dataItem._parent.ourId + '</strong><br></span>')
            .append('<span>' + dataItem.description + '<br></span>')
            .append('<span>' + dataItem._parent._manager._nameSurnameEmail + '<br></span>')
            .append('<span>Termin zakończenia: <b>' + dataItem.endDate + '</b><BR></span>')
            //.append(deadlineAtomicEditLabel.$dom)
            .append('<span>' + dataItem.status + '<br></span>');
        return $collectionElementDescription;
    }
    makeList() {
        return super.makeList();
    }
    selectTrigger(itemId) {
        if (itemId !== undefined) {
            super.selectTrigger(itemId);
            //$('#contractDashboard').attr('src','../Cases/CasesList.html?parentItemId=' + this.connectedRepository.currentItem.id  + '&contractId=' + this.connectedRepository.currentItem.contractId);
        }
    }
}
