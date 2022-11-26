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
var MeetingArrangementsCollection = /** @class */ (function (_super) {
    __extends(MeetingArrangementsCollection, _super);
    function MeetingArrangementsCollection(initParamObject) {
        var _this = _super.call(this, {
            id: initParamObject.id,
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
            connectedRepository: MeetingsSetup.meetingArrangementsRepository
        }) || this;
        _this.initialise(_this.makeList());
        return _this;
    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
     * @dataItem connectedRepository.items[i]
     */
    MeetingArrangementsCollection.prototype.makeItem = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        return {
            id: dataItem.id,
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
    MeetingArrangementsCollection.prototype.makeTitle = function (dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem._case._parent._parent.number + ' ' + dataItem._case._type.folderNumber + ' ' + dataItem._case._type.name + ' ' + dataItem.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    MeetingArrangementsCollection.prototype.makeDescription = function (dataItem) {
        if (!dataItem.description)
            dataItem.description = '';
        var $collectionElementDescription = $('<span>');
        var $footer = $('<span class="comment">');
        if (dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br><span>');
        var deadlineLabel = '';
        if (dataItem.deadline) {
            deadlineLabel = 'Wykonać do: ' + dataItem.deadline + '&#9889;';
            $footer.append(deadlineLabel);
        }
        var ownerLabel = '';
        if (dataItem._owner) {
            ownerLabel = 'Przypisane do:&nbsp;' + dataItem._owner.name + '&nbsp;' + dataItem._owner.surname;
            $footer.append(' ' + ownerLabel);
        }
        $collectionElementDescription
            .append($footer);
        return $collectionElementDescription;
    };
    MeetingArrangementsCollection.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) {
            return item.dataItem._parent.id == _this.parentDataItem.id;
        });
    };
    MeetingArrangementsCollection.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
    };
    return MeetingArrangementsCollection;
}(SimpleCollection));
