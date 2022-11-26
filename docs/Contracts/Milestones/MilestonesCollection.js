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
var MilestonesCollection = /** @class */ (function (_super) {
    __extends(MilestonesCollection, _super);
    function MilestonesCollection(initParamObject) {
        var _this = _super.call(this, { id: initParamObject.id,
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
            connectedRepository: MilestonesSetup.milestonesRepository
        }) || this;
        _this.initialise(_this.makeList());
        return _this;
    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
     * @dataItem connectedRepository.items[i]
     */
    MilestonesCollection.prototype.makeItem = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        return { id: dataItem.id,
            //icon:   'info',
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            editUrl: dataItem.editUrl,
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    MilestonesCollection.prototype.makeTitle = function (dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem._type._folderNumber + ' ' + dataItem._type.name + ' | ' + dataItem.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    MilestonesCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        //TODO: kiedyś dodać edyzcję dat
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, dataItem, new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField', 'Termin wykonania', true), 'deadline', this);
        (dataItem.status) ? true : dataItem.status = "";
        if (dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');
        $collectionElementDescription
            .append('<span>' + dataItem.startDate + ' - ' + dataItem.endDate + '<BR></span>')
            //.append(deadlineAtomicEditLabel.$dom)
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom);
        return $collectionElementDescription;
    };
    MilestonesCollection.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) {
            //console.log('this.parentDataItem.id: %s ==? %s', this.parentDataItem.id, item.dataItem._parent.id)
            return item.dataItem._parent.id == _this.parentDataItem.id;
        });
    };
    MilestonesCollection.prototype.selectTrigger = function (itemId) {
        var isDashboardLoaded = $('#contractDashboard').attr('src') && $('#contractDashboard').attr('src').includes('ContractDashboard');
        if (itemId !== undefined && this.connectedRepository.currentItem.id != itemId ||
            isDashboardLoaded) {
            _super.prototype.selectTrigger.call(this, itemId);
            $('#contractDashboard').attr('src', '../Cases/CasesList.html?parentItemId=' + this.connectedRepository.currentItem.id + '&contractId=' + this.connectedRepository.currentItem.contractId);
        }
    };
    return MilestonesCollection;
}(SimpleCollection));
