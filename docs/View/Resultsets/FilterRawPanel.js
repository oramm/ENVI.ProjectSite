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
/*
 * http://materializecss.com/collapsible.html
 */
var FilterRawPanel = /** @class */ (function (_super) {
    __extends(FilterRawPanel, _super);
    function FilterRawPanel(initParamObject) {
        var _this_1 = _super.call(this, initParamObject) || this;
        _this_1.formElements = initParamObject.formElements;
        _this_1.createResultset = initParamObject.createResultset;
        _this_1.form = new Form("form_" + _this_1.id, "GET", _this_1.formElements, true, 'Filtruj');
        _this_1.resultset = { $dom: $('<div>') };
        _this_1.$dom = $('<div>')
            .attr('id', 'container' + '_' + _this_1.id);
        _this_1.$actionsMenu = $('<div>')
            .attr('id', 'actionsMenu' + '_' + _this_1.id)
            .addClass('cyan lighten-5')
            .addClass('actionsMenu');
        _this_1.buildDom();
        return _this_1;
    }
    /*
     * @param {CollapsibleItems[]} items - generowane m. in. SompleCollapsible
     * @param {type} parentViewObject
     * @param {type} parentViewObjectSelectHandler
     * @returns {undefined}
     */
    FilterRawPanel.prototype.buildDom = function () {
        this.$actionsMenu.append(this.form.$dom);
        this.$dom
            .append(this.$actionsMenu)
            .append(this.resultset.$dom);
        this.setSubmitAction();
        this.formElements.map(function (element) { return element.input.$dom.addClass('col s' + element.colSpan); });
    };
    FilterRawPanel.prototype.refreshResultset = function () {
    };
    /*
     * Funkcja musi być obsłużona w klasie pochodnej.
     * Klasa pochodna musi mieć metodę submitTrigger()
     */
    FilterRawPanel.prototype.setSubmitAction = function () {
        var _this_1 = this;
        this.form.$dom.submit(function (event) {
            _this_1.submitTrigger();
            // prevent default posting of form
            event.preventDefault();
        });
    };
    FilterRawPanel.prototype.submitTrigger = function () {
        var _this_1 = this;
        this.resultset.$dom.hide();
        this.$dom.append(this.makePreloader('preloader_' + this.parentViewObject.id));
        var criteriaParameters = {};
        var _this = this;
        this.form.submitHandler(criteriaParameters)
            .then(function () {
            if (_this_1.form.validate(criteriaParameters)) {
                var promises = [
                    InvoicesSetup.invoicesRepository.initialiseNodeJS('invoices/?startDate=' + criteriaParameters.startDate + '&endDate=' + criteriaParameters.endDate),
                    InvoicesSetup.invoiceitemsRepository.initialiseNodeJS('invoiceItems/?startDate=' + criteriaParameters.startDate + '&endDate=' + criteriaParameters.endDate)
                ];
                Promise.all(promises)
                    .then(function (res) {
                    var oldResultset = _this.resultset;
                    _this.resultset = _this_1.createResultset();
                    oldResultset.$dom.replaceWith(_this.resultset.$dom);
                    return ('collapsible made');
                })
                    .then(function (res) {
                    $('select').material_select();
                    $('.modal').modal();
                    $('.datepicker').pickadate(MainSetup.datePickerSettings);
                    Materialize.updateTextFields();
                    $('ul.tabs').tabs();
                    iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
                    _this_1.$dom.find('.progress').remove();
                    ReachTextArea.reachTextAreaInit();
                });
            }
            else
                alert('Podaj prawidłowe kryteria');
        });
    };
    return FilterRawPanel;
}(Resultset));
