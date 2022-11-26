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
var PsNavigationBar = /** @class */ (function (_super) {
    __extends(PsNavigationBar, _super);
    function PsNavigationBar(parentViewObject) {
        var _this = _super.call(this, 'Witryna projektu', parentViewObject) || this;
        _this.addNewHref = 'https://docs.google.com/forms/d/e/1FAIpQLSd6H8zXQwsKmVIxia6hTlv03Hhz6Ae7GvIUV-PDm4If5BqVXQ/viewform';
        $(document).ready(_this.initialise());
        return _this;
    }
    PsNavigationBar.prototype.initialise = function () {
        _super.prototype.initialise.call(this);
        var $projectPicker = new SearchNavigationBar('projPicker-nav1');
        $('nav').after($projectPicker);
        $projectPicker.children();
        //.append(this.halfwayButton());
    };
    PsNavigationBar.prototype.initialiseMenuItems = function () {
        this.menuItems = [{
                caption: "Dane projektu",
                link: 'Projects/projectDetails.html?parentItemId=' + MainSetup.currentProject.ourId
            },
            {
                caption: "Kontrakty",
                link: 'Contracts/ContractsList.html?parentItemId=' + MainSetup.currentProject.ourId
            },
            {
                caption: "Pisma",
                link: 'Letters/LettersList.html?parentItemId=' + MainSetup.currentProject.ourId
            },
            {
                caption: "Osoby",
                link: 'PersonRoles/Roles.html?parentItemId=' + MainSetup.currentProject.ourId
            }
            //{ caption: "Gant", 
            //  link: 'Contracts/Gant/Gant.html?parentItemId=' + MainSetup.currentProject.ourId
            //}
        ];
        this.addMenuItems($('#main-nav ul'));
        this.addMenuItems($('#mobile-demo'));
    };
    PsNavigationBar.prototype.menuItemClickHandler = function (link) {
        if (link.includes('http'))
            window.open(link, 'link');
        else
            this.parentViewObject.loadIframe("iframeMain", link);
    };
    return PsNavigationBar;
}(NavigationBar));
