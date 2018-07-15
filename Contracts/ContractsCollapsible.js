class ContractsCollapsible extends SimpleCollapsible {
    constructor(id, connectedRepository){
        super(id, 'Kontrakty', connectedRepository) ;
        this.initialise(this.makeCollapsibleItemsList());
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var value = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(dataItem.value);
        return {    id: dataItem.id,
                    name: dataItem.number + '; ' + dataItem.name + '; ' + value,
                    $body: $bodyDom  
                    };
    }
    
    makeBodyDom(dataItem){
    var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForContract' + dataItem.id)
            .attr('contractid',dataItem.id)
            .append(new MilestonesCollection('milestonesListCollection' + dataItem.id, dataItem.id).$dom);
    return $panel;
    }

    /* 
     * @deprecated do usuięcia po dodaniu w pzeryszłości modala dla kontraktów
     */
    addNewHandler(){
        window.open('https://docs.google.com/forms/d/e/1FAIpQLScWFEQ1FevfUD2_KeQ5ew-hyb5ZwaMv5hHai9kTy_WUk2cM2A/viewform?usp=pp_url&entry.1995376000='+ this.connectedRepository.projectId +'&entry.798100984&entry.2087120541&entry.325833130"');
    }
    
}