class NavigationBar {
    constructor(parentViewObject){
        this.parentViewObject = parentViewObject;
        
        this.addNewHref = 'https://docs.google.com/forms/d/e/1FAIpQLSd6H8zXQwsKmVIxia6hTlv03Hhz6Ae7GvIUV-PDm4If5BqVXQ/viewform'
        $( document ).ready(this.initialise());
    }
    
    initialise(){
        this.$mainNavDom = $('<nav class="green darken-1">');
        this.$sideNavDom = $('<ul class="sidenav" id="mobile-demo">');
        $('#content').prepend(this.$sideNavDom);
        $('#content').prepend(this.$mainNavDom);
        $('nav').append('<div class="nav-wrapper" id="main-nav">');
        $('.nav-wrapper')
            .append('<a href="#!" class="brand-logo">Witryna Projektu</a>')
            .append('<a href="#" data-target="mobile-demo" class="sidenav-trigger"><i class="material-icons">menu</i></a>')
            .append('<ul class="right hide-on-med-and-down">');
            
        
        $(".sidenav").sidenav();
        
        var $projectPicker = new SearchNavigationBar('projPicker-nav1');
        $('nav').after($projectPicker);
        $projectPicker.children()
            .append(this.halfwayButton());
    }
    
    initialiseMenuItems(){
        this.menuItems = [{ caption: "Dane projektu", 
                            link: 'Projects/projectDetails.html?projectId=' + projectsRepository.selectedItem.id
                          },
                          { caption: "Lista kontaktowa", 
                            link: 'PersonRoles/personRoles.html?projectId=' + projectsRepository.selectedItem.id
                          },
                          { caption: "Kontrakty", 
                            link: 'Contracts/ContractsList.html?projectId=' + projectsRepository.selectedItem.id
                          }
                         ];
        this.addMenuItems($('#main-nav ul'));
        this.addMenuItems($('#mobile-demo'));
    }
    
    addMenuItems($element){
        $element.empty();
        for (var i =0; i<this.menuItems.length;i++) {
            $element.append('<li>').children(':last')
                    .append('<a>').children(':last')
                    .attr("link", this.menuItems[i].link)
                    .html(this.menuItems[i].caption);
        }
        this.menuItemSetClickAction();
    }
    
    menuItemSetClickAction(){
        this.$mainNavDom.find("li > a").off('click');
        this.$sideNavDom.find("li > a").off('click');
        var _this = this;
        this.$mainNavDom.find("li > a").click(function() {   
                                            //_this.$dom.find(".collection-item").attr("class", "collection-item avatar");
                                            //$(this).attr("class", "collection-item avatar active");
                                            _this.menuItemclickHandler($(this).attr("link"));
                                        });
        this.$sideNavDom.find("li > a").click(function() {   
                                            //_this.$dom.find(".collection-item").attr("class", "collection-item avatar");
                                            //$(this).attr("class", "collection-item avatar active");
                                            _this.menuItemclickHandler($(this).attr("link"));
                                        });
    }
    
    menuItemclickHandler(link){
        this.parentViewObject.loadIframe("iframeProjectDetails", link);
    }
    
    setClickAction(){
        this.$dom.find("li").off('click');
        var _this = this;
        
    }
    
    halfwayButton(){
        var $button = $('<a class="btn-floating btn-large halfway-fab waves-effect waves-light teal">')
                .attr('href', this.addNewHref)
                .append('<i class="material-icons">add</i>');
        return $button;
      }
}

class MenuItem{
    constructor(caption, link){
        this.caption = caption;
        this.link = link;
    }
}