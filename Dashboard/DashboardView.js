class DashboardView extends Popup{
    
    constructor(){
        super();
    }
    
    initialise(){
        this.loadIframe("myTasks", '../Cases/Tasks/MyTasks/myTasks.html');
        this.loadIframe("currentDeadlines", '../Contracts/Milestones/CurrentMilestones/currentMilestones.html');
        console.log("DashboardView initialised");
        
    }
}