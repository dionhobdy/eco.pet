window.$ = window.jQuery = require('jquery');

$(document).ready(function () {
    $("#info, #settings").click(function () {
        $("#placeHolder").fadeOut("fast");
    }); // the info and settings buttons should pull the pet graphics

    $("#pet").click(function () {
        $("#placeHolder").fadeIn("fast");
    }); // the pet button should bring the pet graphics back 
});