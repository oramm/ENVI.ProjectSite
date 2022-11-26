"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GantView = /** @class */ (function (_super) {
    __extends(GantView, _super);
    function GantView() {
        return _super.call(this) || this;
    }
    GantView.prototype.initialise = function () {
        this.setTittle("Wykres Ganta");
        this.makeGant();
        this.dataLoaded(true);
    };
    //https://developers.google.com/chart/interactive/docs/gallery/ganttchart#a-simple-example
    GantView.prototype.makeGant = function () {
        var _this_1 = this;
        google.charts.load('current', { 'packages': ['gantt'] });
        google.charts.setOnLoadCallback(function () { return _this_1.drawChart(_this_1); });
    };
    GantView.prototype.makeColumns = function (data) {
        data.addColumn('string', 'Task ID');
        data.addColumn('string', 'Task Name');
        data.addColumn('string', 'Status');
        data.addColumn('date', 'Start Date');
        data.addColumn('date', 'End Date');
        data.addColumn('number', 'Duration');
        data.addColumn('number', 'Percent Complete');
        data.addColumn('string', 'Dependencies');
    };
    GantView.prototype.makeRows = function (data) {
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
    };
    GantView.prototype.drawChart = function (_this) {
        var data = new google.visualization.DataTable();
        _this.makeColumns(data);
        _this.makeRows(data);
        var options = { height: 42 * ContractsSetup.contractsRepository.items.length,
        };
        var chart = new google.visualization.Gantt(document.getElementById('gantChart'));
        chart.draw(data, options);
    };
    return GantView;
}(Popup));
