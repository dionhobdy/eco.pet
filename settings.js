window.$ = window.jQuery = require('jquery');

$(document).ready(function () {
    $("#setScreen").hide(); // hide the first placeholder, otherwise it will appear over the initial place holder

    $("#settings").click(function () {
        $("#placeHolder").hide();
        $("#setScreen").fadeIn("fast");
    }); // the settings button should pull the pet graphics

    $("#pet, #water, #weather").click(function () {
        $("#setScreen").hide();
        $("#placeHolder").fadeIn("fast");
    }); // the pet, water and weather buttons should bring the pet graphics back 
});