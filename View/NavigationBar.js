class NavigationBar {
    constructor(){
        this.menuItems = [{caption: "Osoby", link: "aa"},
                          {caption: "Zadania", link: "vv"},
                         ];
        this.addNewHref = 'https://docs.google.com/forms/d/e/1FAIpQLSd6H8zXQwsKmVIxia6hTlv03Hhz6Ae7GvIUV-PDm4If5BqVXQ/viewform'
        $( document ).ready(this.initialise());
    }
    
    initialise(){
        $('#content').prepend('<ul class="sidenav" id="mobile-demo">')
        $('#content').prepend('<nav class="green darken-1">');
        $('nav').append('<div class="nav-wrapper" id="main-nav">');
        $('.nav-wrapper')
            .append('<a href="#!" class="brand-logo">Witryna Projektu</a>')
            .append('<a href="#" data-target="mobile-demo" class="sidenav-trigger"><i class="material-icons">menu</i></a>')
            .append('<ul class="right hide-on-med-and-down">');
            
        this.addMenuItems($('#main-nav ul'));
        this.addMenuItems($('#mobile-demo'));
        $(".sidenav").sidenav();
        
        var $projectPicker = new SearchNavigationBar('projPicker-nav1');
        $('nav').after($projectPicker);
        $projectPicker.children()
            .append(this.halfwayButton());
    }

    addMenuItems($element){
        for (var i =0; i<this.menuItems.length;i++) {
            $element.append('<li>').children(':last')
                .append('<a>').children(':last')
                .attr('href',this.menuItems[i].link)
                .html(this.menuItems[i].caption);
        }
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