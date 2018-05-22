var RESTURL = "http://localhost:3000";

function disableInputs(inputs) {
    inputs.prop('disabled', true);
}

function enableInputs(inputs) {
    inputs.prop('disabled', false);
}

function showAlert(beforeElem, type, text) {
    console.log("itt vagyok a showAlertben");
    var formAlertId = 'form-alert';

    $("#" + formAlertId).remove();

    $('<div class="alert alert-' + type + '" id="' + formAlertId + '" role="alert">' + text + '</div>')
        .insertBefore(beforeElem).fadeIn();

    setTimeout(function () {
        $("#" + formAlertId).fadeOut(function () {
            $(this).remove();
        });
    }, 3000);
};

function refreshReservationList() {
    $.getJSON(RESTURL + "/reservations").done(
        function (reservationList) {
            $('#reservation-list > pre')[0].innerText = JSON.stringify(reservationList, null, 2);
        }
    );
}

$("#modalsubmit").on("click", function newReservationTag(event) {
    // bongeszo beepitett submit esemeny megallitasa
    event.preventDefault()

    // jquery form elem
    var newReservationFormElem = $("#newReservationForm");
    
    // bongeszo native form elem
    var newReservationFormNativeElem = newReservationFormElem[0];

    // check html5 validator
    // if (newReservationFormNativeElem.checkValidity() == true) {
        // Itt valid az urlapom
        var serializedFormArray = newReservationFormElem.serializeArray();
        var data = {new: "true"};
        $(serializedFormArray).each(
            function (index, elem) {
                data[elem['name']] = elem['value'];
                
            }
        );

        var inputs = $('input', newReservationFormElem);
        disableInputs(inputs);

        $.ajax({
            type: "POST",
            url: RESTURL + "/reservations",
            "data": data,
            dataType: 'json'
        }).done(function (returnData) {
            console.log("returnData => ", returnData);
            newReservationFormElem.removeClass('was-validated');
            newReservationFormNativeElem.reset();
            enableInputs(inputs);

            showAlert(newReservationFormElem, 'success', 'Sikeres mentés');
//            refreshReservationList();
            $("#controlResertvationModal").modal("hide");
        }).fail(function () {
            // alert("Hiba a server elérésénél");

            enableInputs(inputs);
            showAlert(newReservationFormElem, 'warning', 'Hiba a serveren');
            $("#controlResertvationModal").modal("hide");
        });
        
    // }

    if (newReservationFormElem.hasClass('was-validated') == false) {
        newReservationFormElem.addClass('was-validated');
    }
});

//$(document).ready(function () {
//    refreshReservationList();
//});
function controlResertvationModal() {
    $("#controlResertvationModal").modal("show");
    $("#modal-body1").text("Név: "+$('#name').val());
    $("#modal-body2").text("Mobilszám: "+$('#phnum').val());
    $("#modal-body3").text("E-mail: "+$('#em').val());
    $("#modal-body4").text("Érkezés: "+$('#arrival').val());
    $("#modal-body5").text("Elutazás: "+$('#departure').val());
    $("#modal-body6").text("Felnőttek: "+$('#adult').val());
    $("#modal-body7").text("Gyerekek: "+$('#child').val());
    $("#modal-body8").text("Szobák: "+$('#room').val());
    $("#modal-body9").text("Megjegyzés: "+$('#txarea').val());
}