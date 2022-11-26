"use strict";
class OrgChart {
    constructor(initParamObject) {
        this.parentNode = initParamObject.parentNode;
        this.connectedRepository = initParamObject.connectedRepository;
        this.dataTable = this.makeDataTable();
        google.charts.load('current', { packages: ["orgchart"] });
        google.charts.setOnLoadCallback(() => this.drawChart());
    }
    drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('string', 'Manager');
        data.addColumn('string', 'ToolTip');
        //this.makeHeaderDataTable();
        // For each orgchart box, provide the name, manager, and tooltip to show.
        data.addRows(this.dataTable);
        // Create the chart.
        var chart = new google.visualization.OrgChart(this.parentNode);
        // Draw the chart, setting the allowHtml option to true for the tooltips.
        chart.draw(data, { 'allowHtml': true });
    }
    makeDataTable() {
        var dataTable = [];
        for (const item of this.connectedRepository.items) {
            dataTable.push([
                item.name,
                item.managerId ? item.managerId : '',
                item.description ? item.description : ''
            ]);
        }
        return dataTable;
    }
    makeHeaderDataTable(items) {
        var dataTable = [];
        this.dataTable.push(item.name);
        this.dataTable[0].push(item.managerId ? item.managerId : '');
        this.dataTable[0].push(item.description ? item.description : '');
        return dataTable;
    }
}
