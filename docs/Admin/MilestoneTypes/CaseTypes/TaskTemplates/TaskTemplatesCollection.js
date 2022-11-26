"use strict";
class TaskTemplatesCollection extends SimpleCollection {
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
            connectedRepository: TaskTemplatesSetup.taskTemplatesRepository
        });
        this.status = initParamObject.status;
        //nie ma nadrzędnego Collapsible więc definiuję modale tutaj
        this.addNewModal = new TaskTemplateModal(this.id + '_newTaskTemplate', 'Dodaj szablon zadania', this, 'ADD_NEW');
        this.editModal = new TaskTemplateModal(this.id + '_editTaskTemplate', 'Edytuj szablon zadania', this, 'EDIT');
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
        (dataItem.status) ? true : dataItem.status = "";
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append('<span>' + dataItem.deadlineRule + '<br></span>')
            .append('<span>' + dataItem.status + '<br></span>');
        return $collectionElementDescription;
    }
    //makeList(){
    //    return super.makeList().filter((item)=>item.dataItem.caseId==this.parentDataItem.id;
    //}
    selectTrigger(itemId) {
        super.selectTrigger(itemId);
        //$('#contractDashboard').attr('src','../Cases/CasesList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    }
}
