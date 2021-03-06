class ContractDashboardView extends Popup {

    constructor() {
        super();
    }

    initialise() {
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
        })
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