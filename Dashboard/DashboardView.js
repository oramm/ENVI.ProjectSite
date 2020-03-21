class DashboardView extends Popup{
    
    constructor(){
        super();
    }
    
    initialise(){
        this.loadIframe("help", '../Help/Help.html');
        this.loadIframe("myTasks", '../Cases/Tasks/MyTasks/MyTasks.html');
        this.loadIframe("currentDeadlines", '../Contracts/Milestones/CurrentMilestones/CurrentMilestones.html');
        console.log("DashboardView initialised");
        
    }
}