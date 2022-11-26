"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var RolesCollection = /** @class */ (function (_super) {
    __extends(RolesCollection, _super);
    function RolesCollection(initParamObject) {
        var _this = _super.call(this, {
            id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: "Role",
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: initParamObject.parentDataItem.name.match(/Wykon/i) === null,
            isDeletable: true,
            connectedRepository: RolesSetup.rolesRepository
        }) || this;
        _this.initialise(_this.makeList());
        return _this;
    }
    RolesCollection.prototype.makeItem = function (dataItem) {
        var phoneLabel = (dataItem._person.phone) ? 'tel.: <a href="tel:' + dataItem._person.phone + '">' + dataItem._person.phone + '</a> ' : '';
        var cellphoneLabel = (dataItem._person.cellphone) ? 'kom.: <a href="tel:' + dataItem._person.cellphone + '">' + dataItem._person.cellphone + '</a> ' : '';
        var mailLabel = (dataItem._person.email) ? 'mail: <a href="mailto:' + dataItem._person.email + '">' + dataItem._person.email + '</a>' : '';
        var description = (dataItem.description) ? '<br>' + dataItem.description : '';
        var contractNumber = '';
        if (dataItem._contract.number)
            contractNumber = dataItem._contract.number;
        else if (dataItem._contract.ourId)
            contractNumber = dataItem._contract.ourId;
        return {
            id: dataItem.id,
            icon: 'person',
            $title: dataItem._person.name + ' ' +
                dataItem._person.surname + ': ' +
                dataItem._person._entity.name,
            $description: contractNumber + ' ' + dataItem.name + '<BR>' +
                cellphoneLabel +
                phoneLabel +
                mailLabel +
                description,
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    RolesCollection.prototype.makeTitle = function (dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    RolesCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description, dataItem, new ReachTextArea(this.id + '_' + dataItem.id + '_tmpDescriptionReachTextArea', 'Opis', true, 500), 'description', this);
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom);
        return $collectionElementDescription;
    };
    RolesCollection.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) { return item.dataItem.groupName == _this.parentDataItem.name; });
    };
    return RolesCollection;
}(SimpleCollection));
