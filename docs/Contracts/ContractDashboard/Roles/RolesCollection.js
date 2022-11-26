"use strict";
class RolesCollection extends SimpleCollection {
    constructor(initParamObject) {
        super({
            id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: "Role",
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: false,
            isEditable: true,
            isAddable: initParamObject.parentDataItem.name.match(/Wykonaw/i),
            isDeletable: true,
            connectedRepository: RolesSetup.rolesRepository
        });
        this.initialise(this.makeList());
    }
    makeItem(dataItem) {
        var phoneLabel = (dataItem._person.phone) ? 'tel.: <a href="tel:' + dataItem._person.phone + '">' + dataItem._person.phone + '</a> ' : '';
        var cellphoneLabel = (dataItem._person.cellphone) ? 'kom.: <a href="tel:' + dataItem._person.cellphone + '">' + dataItem._person.cellphone + '</a> ' : '';
        var mailLabel = (dataItem._person.email) ? 'mail: <a href="mailto:' + dataItem._person.email + '">' + dataItem._person.email + '</a>' : '';
        var description = (dataItem.description) ? '<br>' + dataItem.description : '';
        return {
            id: dataItem.id,
            icon: 'person',
            $title: dataItem._person.name + ' ' +
                dataItem._person.surname + ': ' +
                dataItem._person._entity.name,
            $description: dataItem.name + '<BR>' +
                cellphoneLabel +
                phoneLabel +
                mailLabel +
                description,
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
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description, dataItem, new ReachTextArea(this.id + '_' + dataItem.id + '_tmpDescriptionReachTextArea', 'Opis', true, 500), 'description', this);
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom);
        return $collectionElementDescription;
    }
    makeList() {
        return super.makeList().filter((item) => {
            var test = item.dataItem.groupName == this.parentDataItem.name;
            if (test && this.parentDataItem.name == 'Wykonawca/Podwykonawcy')
                test = item.dataItem.contractId == MainSetup.currentContract.id;
            return test;
        });
    }
}
