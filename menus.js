window.$ = window.jQuery = require('jquery');

$(document).ready(function () {
    $("#infoScreen, #setScreen").hide(); // hide the first placeholder, otherwise it will appear over the initial place holder

    $("#settings").click(function () {
        $("#placeHolder, #infoScreen").hide();
        $("#setUpdate, #setConfirm").hide();
        $("#setScreen").fadeIn("fast");

        $("#setInside").click(function () {
            $("#setUpdate").text("Location Mode Updated");
            $("#setConfirm").text("Inside");
            $("#setUpdate, #setConfirm").fadeIn(1000);
            $("#setUpdate, #setConfirm").fadeOut(1500);
        }); // update the inner html of locationConfirm and fade in

        $("#setOutside").click(function () {
            $("#setUpdate").text("Location Mode Updated");
            $("#setConfirm").text("Outside");
            $("#setUpdate, #setConfirm").fadeIn(1000);
            $("#setUpdate, #setConfirm").fadeOut(1500);
        }); // update the inner html of locationConfirm and fade in

        $("#setOn").click(function () {
            $("#setUpdate").text("Audio Updated");
            $("#setConfirm").text("On");
            $("#setUpdate, #setConfirm").fadeIn(1000);
            $("#setUpdate, #setConfirm").fadeOut(1500);
        });

        $("#setOff").click(function () {
            $("#setUpdate").text("Audio Updated");
            $("#setConfirm").text("Off");
            $("#setUpdate, #setConfirm").fadeIn(1000);
            $("#setUpdate, #setConfirm").fadeOut(1500);
        });

    }); // the settings button should pull graphics and display settings screen

    $("#info").click(function () {
        $("#placeHolder, #setScreen").hide();
        $("#infoScreen").fadeIn("fast");
    }); // the info button should pull graphics and display info screen

    $("#pet, #water, #weather").click(function () {
        $("#infoScreen, #setScreen").hide();
        $("#placeHolder").fadeIn("fast");
    }); // the pet, water and weather buttons should bring the pet graphics back 
});