"use strict";
var Popup = /** @class */ (function () {
    function Popup() {
        this.preloaderBar = '<div class="progress">' +
            'zapisuję...<div class="indeterminate"></div>' +
            '</div>';
        this.loadingWheel = '<article>Ładuję dane...</article>' +
            '<div class="preloader-wrapper big active">' +
            '<div class="spinner-layer spinner-green-only">' +
            '<div class="circle-clipper left">' +
            '<div class="circle"></div>' +
            '</div><div class="gap-patch">' +
            '<div class="circle"></div>' +
            '</div><div class="circle-clipper right">' +
            '<div class="circle"></div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }
    Popup.prototype.showLoadingWheel = function (HTMLElement) {
        $(HTMLElement).append(this.loadingWheel);
    };
    Popup.prototype.showPreloader = function (HTMLElement) {
        $(HTMLElement).append(this.preloaderBar);
    };
    Popup.prototype.hidePreloader = function (HTMLElement) {
        $(HTMLElement).remove();
    };
    Popup.prototype.setTittle = function (title) {
        $("#title").html("<H4>" + title + "</h4>");
    };
    Popup.prototype.makeSubTittle = function (title) {
        return $("<H5>" + title + "</h5>");
    };
    Popup.prototype.setStatus = function (message) {
        $("#status").append("<p>" + message + "</p>");
    };
    Popup.prototype.setForm = function () {
    };
    Popup.prototype.dataLoaded = function (loaded) {
        if (loaded) {
            $("#loading").hide();
            $("#content").show();
        }
        else {
            $("#content").hide();
            $("#loading").append(this.loadingWheel);
            $("#loading").show();
        }
    };
    Popup.prototype.loadIframe = function (iframeName, url) {
        var $iframe = $('#' + iframeName);
        if ($iframe.length) {
            $iframe.attr('src', url);
            return false;
        }
        return true;
    };
    return Popup;
}());
