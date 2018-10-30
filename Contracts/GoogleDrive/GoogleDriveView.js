class GoogleDriveView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.loadIframe("gdFolder", 'https://drive.google.com/embeddedfolderview?id='+ window.parent.projectsRepository.currentItem.gdFolderId +'#list');
        this.dataLoaded(true);       
    }
}