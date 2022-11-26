"use strict";
class MilestoneTemplatesCollection extends SimpleCollection {
    constructor(initParamObject) {
        super({ id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            isSelectable: true,
            connectedRepository: ContractTypesSetup.milestoneTemplatesRepository
        });
        this.initialise(this.makeList());
        this.setAddableMode();
    }
    setAddableMode() {
        var isLimitReached = this.parentDataItem.isUniquePerContract &&
            ContractTypesSetup.milestoneTemplatesRepository.items.filter(item => item._milestoneType.id == this.parentDataItem.id).length > 0;
        this.isAddable = !isLimitReached;
        this.refreshAddableMode();
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
            dataItem: dataItem
        };
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem._milestoneType.name + ' | ' + dataItem.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        (dataItem.status) ? true : dataItem.status = "";
        if (dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');
        $collectionElementDescription
            .append('<span>' + dataItem.startDateRule + ' - ' + dataItem.endDateRule + '<BR></span>');
        return $collectionElementDescription;
    }
    makeList() {
        return super.makeList().filter((item) => {
            return item.dataItem._milestoneType.id == this.parentDataItem.id;
        });
    }
    selectTrigger(itemId) {
        super.selectTrigger(itemId);
    }
}
