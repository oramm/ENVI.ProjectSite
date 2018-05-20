class CasesCollapsible extends Collapsible {
    constructor(id){
        super('Sprawę');
        this.id = id;
        this.tasksPanels=[];
        this.makeTasksPanels();
        return this.initialise(id, 
                               this.makeCollapsibleItemsList(), 
                               this.selectHandler);
        
    }

    makeTasksPanels(){
        for(var i=0; i<casesRepository.items.length; i++){
            var $addTaskButton = FormTools.createFlatButton('Dodaj zadanie', 
                                                            function() {window.open('https://docs.google.com/forms/d/e/1FAIpQLSe5FPtniH4tAhB7moQlY1-nuegf6tHBW-2_gLTCJxpgeQOnpA/viewform?usp=pp_url&entry.1995376000='+$(this).parent().attr('caseid')+ '&entry.1071441075&entry.798100984&entry.2087120541&entry.556284748');}
                                                            );

            
            var $panel = $('<div>')
                                .attr('id', 'tasksActionsMenuForCase'+casesRepository.items[i].id)
                                .attr('caseid',casesRepository.items[i].id)
                                .append($addTaskButton)
                                .append(new TasksCollection('tasksListCollection' + i, casesRepository.items[i].id).$dom)
            
            
            this.tasksPanels[i] = $panel;
        }
    }

    
    makeCollapsibleItemsList(){
        var itemsList = [];
        var item;
        for (var i=0; i<casesRepository.items.length; i++){
            var value = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(casesRepository.items[i].value/100);
            item = {    name: casesRepository.items[i].number + '; ' + casesRepository.items[i].name + '; ' + value,
                        $body:   this.tasksPanels[i],
                        editUrl: casesRepository.items[i].editUrl
                    };
            itemsList.push(item);
            }
        return itemsList;
    }
    
    addNewHandler(){
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSf6sZpZeZMwwqvAZ1oAQSWIwOPpG_ZXV8E3XigQcTes4VAi3g/viewform?usp=pp_url&entry.804066860='+ casesRepository.milestoneId);
    }
    
    removeHandler(itemId){
        casesRepository.deleteCase(itemId, this.casesListCollection.removeHandler, this.casesListCollection)
            .catch(err => {
                      console.error(err);
                    });
    }
    
    selectHandler(itemId){
        casesRepository.itemSelected(itemId);
        parent.$('#iframeTasks').attr('src','Tasks/TasksList.html?projectId=' + casesRepository.selectedItem.projectId + '&caseId=' + casesRepository.selectedItem.id);
        
    }
    
}