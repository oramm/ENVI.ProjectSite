"use strict";
class AdminDashboardView extends Popup {
    constructor() {
        super();
    }
    initialise() {
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
    }
}
