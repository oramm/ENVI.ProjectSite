"use strict";
var OrgChart = /** @class */ (function () {
    function OrgChart(initParamObject) {
        var _this = this;
        this.parentNode = initParamObject.parentNode;
        this.connectedRepository = initParamObject.connectedRepository;
        this.dataTable = this.makeDataTable();
        google.charts.load('current', { packages: ["orgchart"] });
        google.charts.setOnLoadCallback(function () { return _this.drawChart(); });
    }
    OrgChart.prototype.drawChart = function () {
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
    };
    OrgChart.prototype.makeDataTable = function () {
        var dataTable = [];
        for (var _i = 0, _a = this.connectedRepository.items; _i < _a.length; _i++) {
            var item = _a[_i];
            dataTable.push([
                item.name,
                item.managerId ? item.managerId : '',
                item.description ? item.description : ''
            ]);
        }
        return dataTable;
    };
    OrgChart.prototype.makeHeaderDataTable = function (items) {
        var dataTable = [];
        this.dataTable.push(item.name);
        this.dataTable[0].push(item.managerId ? item.managerId : '');
        this.dataTable[0].push(item.description ? item.description : '');
        return dataTable;
    };
    return OrgChart;
}());
