class ScrumBoard {
    constructor(statusesCollections){
        this.statusesCollections = statusesCollections;
        //this.caseId = caseId;
        this.buildDom();
    }
    
    buildDom(){
        this.$dom = $('<div class="row scrumBoard">');
        
        this.$actionsMenu = $('<div >');
        this.$dom
            .append(this.$actionsMenu)
        this.buildStatuses();    
        this.filterInitialise();
    }
    /*
     * Ustawia pole filtra dla wszystkich statusów danego scrumborda
     */
    filterInitialise(){
        this.filter = new Filter([],this);
    }
    
    buildStatuses(){
        for (var i = 0; i<this.statusesCollections.length; i++ ){
            var $col = $('<div class="col">');
            $col
                .addClass('s12')
                .addClass('m6')
                .addClass('l2');
            this.$dom
                .append($col).children(':last-child')
                //.append('<B>' + this.statusesCollections[i].status + '<B>')
                .append(this.statusesCollections[i].$dom);
        
            //this.initDraggable(this.statusesCollections[i].$dom.children('.collection'));
        }
        var _this = this;
        this.$dom.find('.collection').sortable({
                                                    connectWith: ".collection",
                                                    receive: function(e,ui) {   _this.changeStatus(e,ui)
                                                                            },
                                                    start: function(e,ui) {   _this.dragStart(e,ui)
                                                                            },
                                                    stop: function(e,ui) {   _this.dragStop(e,ui)
                                                                            },
                                                  });
        //this.$dom.find('.collection').disableSelection();
    }
    dragStart(e,ui){
        this.$dom.find('.collection')
            .addClass('attractToDrop');   
        ui.item.addClass('z-depth-1');
    }
    dragStop(e,ui){
        this.$dom.find('.collection')
            .removeClass('attractToDrop');
        ui.item.removeClass('z-depth-1');
    }
    
    changeStatus(e, ui){
        var newStatus = ui.item.parent().attr("status");
        var receiverCollection = Tools.search(newStatus,"status", this.statusesCollections);
        
        TasksSetup.tasksRepository.currentItem.status = newStatus;
        TasksSetup.tasksRepository.editItem(TasksSetup.tasksRepository.currentItem,
                                            receiverCollection);
    }
}