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
var ContractDashboardView = /** @class */ (function (_super) {
    __extends(ContractDashboardView, _super);
    function ContractDashboardView() {
        return _super.call(this) || this;
    }
    ContractDashboardView.prototype.initialise = function () {
        var parentItemId = Tools.getUrlVars()['parentItemId'];
        var tabsData = [];
        //tabsData.push({ name: 'Szczegóły',
        //                url: 'Details/ContractDetails.html?parentItemId=' + parentItemId
        //              });
        tabsData.push({
            name: "Pisma",
            url: 'Letters/LettersList.html?parentItemId=' + parentItemId
        });
        tabsData.push({
            name: "Spotkania",
            url: 'Meetings/MeetingsList.html?parentItemId=' + parentItemId
        });
        if (!ContractsSetup.contractsRepository.currentItem._type.isOur)
            tabsData.push({
                name: 'Materiały',
                url: 'MaterialCards/MaterialCardsList.html?parentItemId=' + parentItemId
            });
        tabsData.push({
            name: 'Ryzyka',
            url: 'Risks/RisksList.html?parentItemId=' + parentItemId
        });
        if (!ContractsSetup.contractsRepository.currentItem._type.isOur) {
            tabsData.push({
                name: 'Zgłoszenia',
                url: 'Issues/IssuesList.html?parentItemId=' + parentItemId
            });
        }
        tabsData.push({
            name: 'Osoby',
            url: 'Roles/Roles.html?parentItemId=' + parentItemId
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
    return ContractDashboardView;
}(Popup));
