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
var AdminDashboardView = /** @class */ (function (_super) {
    __extends(AdminDashboardView, _super);
    function AdminDashboardView() {
        return _super.call(this) || this;
    }
    AdminDashboardView.prototype.initialise = function () {
        var parentItemId = Tools.getUrlVars()['parentItemId'];
        var tabsData = [];
        tabsData.push({
            name: 'Typy kontraktów',
            url: 'ContractTypes/ContractTypesList.html'
        });
        tabsData.push({
            name: 'Typy Kamieni milowych',
            url: 'MilestoneTypes/MilestoneTypesList.html'
        });
        tabsData.push({
            name: 'Procesy',
            url: 'Processes/ProcessesList.html'
        });
        $('#content').prepend(new Tabs({
            id: 'contratTabs',
            parentId: parentItemId,
            tabsData: tabsData,
            swipeable: true,
            contentIFrameId: 'contractTabs'
        }).$dom);
        this.dataLoaded(true);
        console.log("DashboardView initialised");
    };
    return AdminDashboardView;
}(Popup));
