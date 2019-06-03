class ContractDashboardView extends Popup{
    
    constructor(){
        super();
    }
    
    initialise(){
        var parentItemId = Tools.getUrlVars()['parentItemId'];
        var tabsData = [    { name: 'Szczegóły',
                              url: 'Details/ContractDetails.html?parentItemId=' + parentItemId
                            },
                            { name: 'Materiały',
                              url: 'MaterialCards/MaterialCardsList.html?parentItemId=' + parentItemId
                            },
                            { name: 'Ryzyka',
                              url: 'Risks/RisksList.html?parentItemId=' + parentItemId
                            },
                            { name: 'Zgłoszenia',
                              url: 'Issues/IssuesList.html?parentItemId=' + parentItemId
                            }
                        ];
        $('#content').prepend(new Tabs({    id: 'contratTabs',
                                            parentId: parentItemId,
                                            tabsData: tabsData,
                                            swipeable: true
                                        }).$dom);  
        this.dataLoaded(true);
        console.log("DashboardView initialised");
    }
}