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
var RolesView = /** @class */ (function (_super) {
    __extends(RolesView, _super);
    function RolesView() {
        return _super.call(this) || this;
    }
    RolesView.prototype.initialise = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.setTittle("Role w projekcie");
            //var $orgChart = $('<div id="orgchart">')
            var entityRawPanel = new RawPanel({
                id: 'newEntityRawPanel',
                connectedRepository: MainSetup.entitiesRepository
            });
            entityRawPanel.initialise(new EntityModal('newEntityModal', 'Dodaj podmiot', entityRawPanel, 'ADD_NEW'));
            var personRawPanel = new RawPanel({
                id: 'newPersonRawPanel',
                connectedRepository: MainSetup.personsRepository
            });
            personRawPanel.initialise(new PersonModal('newPersonModal', 'Dodaj osobę', personRawPanel, 'ADD_NEW'));
            entityRawPanel.$dom.addClass('col l1');
            personRawPanel.$dom.addClass('col l1');
            $('#actionsMenu')
                .append(entityRawPanel.$dom)
                .append(personRawPanel.$dom)
                .after(new RoleGroupsCollapsible('roleGroupsCollapsible').$dom);
            //.after($orgChart)
            //var orgchart = new OrgChart({
            //    parentNode: $orgChart[0],
            //    connectedRepository: RolesSetup.rolesRepository
            //})
            _this.dataLoaded(true);
            resolve('rolesCollection ok');
        });
    };
    RolesView.prototype.actionsMenuInitialise = function () {
    };
    return RolesView;
}(Popup));
