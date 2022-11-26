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
var RoleGroupsCollapsible = /** @class */ (function (_super) {
    __extends(RoleGroupsCollapsible, _super);
    function RoleGroupsCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: false,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            hasArchiveSwitch: false,
            connectedRepository: RolesSetup.roleGroupsRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewModal = new RoleModal(_this.id + '_newRoleModal', 'Dodaj rolę', _this, 'ADD_NEW');
        _this.editModal = new RoleModal(_this.id + '_editRoleModal', 'Edytuj rolę', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        return _this;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    RoleGroupsCollapsible.prototype.makeItem = function (dataItem) {
        return _super.prototype.makeItem.call(this, dataItem);
    };
    RoleGroupsCollapsible.prototype.makeBody = function (dataItem) {
        var subCollection = new RolesCollection({
            id: 'rolesCollection_' + dataItem.id,
            parentDataItem: dataItem,
            addNewModal: this.addNewModal,
            editModal: this.editModal
        });
        var $panel = $('<div>')
            .attr('id', 'collapsibleBody' + dataItem.id)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    return RoleGroupsCollapsible;
}(SimpleCollapsible));
