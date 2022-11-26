"use strict";
class GantView extends Popup {
    constructor() {
        super();
    }
    initialise() {
        this.setTittle("Wykres Ganta");
        this.makeGant();
        this.dataLoaded(true);
    }
    //https://developers.google.com/chart/interactive/docs/gallery/ganttchart#a-simple-example
    makeGant() {
        google.charts.load('current', { 'packages': ['gantt'] });
        google.charts.setOnLoadCallback(() => this.drawChart(this));
    }
    makeColumns(data) {
        data.addColumn('string', 'Task ID');
        data.addColumn('string', 'Task Name');
        data.addColumn('string', 'Status');
        data.addColumn('date', 'Start Date');
        data.addColumn('date', 'End Date');
        data.addColumn('number', 'Duration');
        data.addColumn('number', 'Percent Complete');
        data.addColumn('string', 'Dependencies');
    }
    makeRows(data) {
        var rows = [];
        for (var i = 0; i < ContractsSetup.contractsRepository.items.length; i++) {
            var label = (ContractsSetup.contractsRepository.items[i].ourId) ? (ContractsSetup.contractsRepository.items[i].ourId) : (ContractsSetup.contractsRepository.items[i].number);
            var item = [ContractsSetup.contractsRepository.items[i].name,
                ContractsSetup.contractsRepository.items[i].ourId,
                ContractsSetup.contractsRepository.items[i].ownerId,
                new Date(ContractsSetup.contractsRepository.items[i].startDate),
                new Date(ContractsSetup.contractsRepository.items[i].endDate),
                null,
                0,
                null
            ];
            rows.push(item);
        }
        data.addRows(rows);
    }
    drawChart(_this) {
        var data = new google.visualization.DataTable();
        _this.makeColumns(data);
        _this.makeRows(data);
        var options = { height: 42 * ContractsSetup.contractsRepository.items.length,
        };
        var chart = new google.visualization.Gantt(document.getElementById('gantChart'));
        chart.draw(data, options);
    }
}
