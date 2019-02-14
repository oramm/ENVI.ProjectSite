class ContractDashboardView extends Popup{
    
    constructor(){
        super();
    }
    
    initialise(){
        var parentId = Tools.getUrlVars()['parentId'];
        var tabsData = [    { name: 'Szczegóły',
                              url: 'Details/ContractDetails.html?parentId=' + parentId
                            },
                            { name: 'Ryzyka',
                              url: 'Risks/RisksList.html?parentId=' + parentId
                            },
                            { name: 'Zgłoszenia',
                              url: 'Issues/IssuesList.html?parentId=' + parentId
                            }
                        ];
        $('#content').prepend(new Tabs({    id: 'contratTabs',
                                                    parentId: parentId,
                                                    tabsData: tabsData,
                                                    swipeable: true
                                                }).$dom);  
        this.dataLoaded(true);
        console.log("DashboardView initialised");
    }
}