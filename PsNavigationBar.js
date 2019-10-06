class PsNavigationBar extends NavigationBar {
    constructor(parentViewObject){
        super('Witryna projektu', parentViewObject)
        
        this.addNewHref = 'https://docs.google.com/forms/d/e/1FAIpQLSd6H8zXQwsKmVIxia6hTlv03Hhz6Ae7GvIUV-PDm4If5BqVXQ/viewform'
        $( document ).ready(this.initialise());
    }
    
    initialise(){        
        super.initialise();
        var $projectPicker = new SearchNavigationBar('projPicker-nav1');
        $('nav').after($projectPicker);
        $projectPicker.children()
            //.append(this.halfwayButton());
    }
    
    initialiseMenuItems(){
        this.menuItems = [{ caption: "Dane projektu", 
                            link: 'Projects/projectDetails.html?parentItemId=' + projectsRepository.currentItem.ourId
                          },
                          { caption: "Kontrakty", 
                            link: 'Contracts/ContractsList.html?parentItemId=' + projectsRepository.currentItem.ourId
                          },
                          { caption: "Pisma", 
                            link: 'Letters/LettersList.html?parentItemId=' + projectsRepository.currentItem.ourId
                          },
                          { caption: "Spotkania", 
                            link: 'Meetings/MeetingsList.html?parentItemId=' + projectsRepository.currentItem.ourId
                          },
                          { caption: "Lista kontaktowa", 
                            link: 'PersonRoles/personRoles.html?parentItemId=' + projectsRepository.currentItem.ourId
                          },
                          { caption: "Zarządzaj rolami", 
                            link: 'PersonRoles/Roles/roles.html?parentItemId=' + projectsRepository.currentItem.ourId
                          }
                          //{ caption: "Gant", 
                          //  link: 'Contracts/Gant/Gant.html?parentItemId=' + projectsRepository.currentItem.ourId
                          //}
                         ];
        this.addMenuItems($('#main-nav ul'));
        this.addMenuItems($('#mobile-demo'));
    }
      
    menuItemClickHandler(link){
        if (link.includes('http'))
            window.open(link, 'link');
        else
            this.parentViewObject.loadIframe("iframeMain", link);
    }
}