var pickedup;

$.fn.sendForm = function () {
    var form = $(this);
    var action = form.attr("action");
    var method = form.attr("method") || "post";
    var callBack = form.attr("callBack");

    function checkFormItem(input) {
        input = $(input);
        if (input.attr("required") && input.val() == "") {
            input.parents(".form-group").addClass("invalid");
            return false;
        } else {
            input.parents(".form-group").removeClass("invalid");
        }

        return true;
    }

    form.on("submit", function (ev) {
        ev.preventDefault();
        var formData = {};
        var formIsValid = [];
        $(this).find("input, select, textarea").each(function (index, input) {
            formData[input.name] = input.value;
            formIsValid.push(checkFormItem(input));
        });

        if (formIsValid.indexOf(false) > -1) {
            return;
        }

        $.ajax({
            type: method.toUpperCase(),
            url: action,
            data: formData,
            dataType: 'json'
        }).done(function (resp) {
            console.log(resp);
            if (window[callBack]) {
                window[callBack]();
            }
        });
    });

    return this;
};


$(document).ready(function () {

    var RESTURL = "http://localhost:3000";
    var searchString = '';
    var sortKey = '';
    var sortDirection = '';
    var reservationListTable = $("#reservation-list");
    // lapozas globalis valtozoi
    var pageLimit = 30000; // hany egyed jelenjen meg egy lapon
    var currentPage = 1; // jelenleg hol all a lapozo
    var maxPage = 0; // hany oldalt tudunk megjeleniteni
    var totalCount = 0; // osszes egyed szam amit a server tud szolgaltatni



    // tabla kitoltese javascript object-bol
    function fillReservationsTable(currentReservations) {
        var tbody = $("#reservation-list tbody");
        tbody.html('');

        $.each(currentReservations, function (index, reservation) {
            if (reservation.new) {
                var row = $(".templates .reservation-row").clone().attr('onclick', 'adminReservationModal('+(index+1)+');').attr('style', 'font-weight: bold');
                row.find("td").eq(0).html(reservation.name);
                row.find("td").eq(1).html(reservation.phnum);
                row.find("td").eq(2).html(reservation.em);
                row.find("td").eq(3).html(reservation.arrival);
                row.find("td").eq(4).html(reservation.departure);
                row.find("td").eq(5).html(reservation.adult);
                row.find("td").eq(6).html(reservation.child);
                row.find("td").eq(7).html(reservation.room);
                row.find("td").eq(8).html(reservation.textarea);
                row.find("td").eq(9).html(reservation.new);
                row.find("td").eq(10).html(reservation.id);
                // .attr('style', 'display: none;');

            } else {

                var row = $(".templates .reservation-row").clone().attr('onclick', 'adminReservationModal('+(index+1)+');');
                row.find("td").eq(0).html(reservation.name);
                row.find("td").eq(1).html(reservation.phnum);
                row.find("td").eq(2).html(reservation.em);
                row.find("td").eq(3).html(reservation.arrival);
                row.find("td").eq(4).html(reservation.departure);
                row.find("td").eq(5).html(reservation.adult);
                row.find("td").eq(6).html(reservation.child);
                row.find("td").eq(7).html(reservation.room);
                row.find("td").eq(8).html(reservation.textarea);
            }
                // row.find("td").eq(9).html("<button id='" + index + "' type='button'>Részletek</button>");
                tbody.append(row);
        });
    }
    

    // lista ujratoltese ajax-val (meghivja a fillReservationsTable-t is!)
    function refreshReservationList() {
        var urlParams = [];
        var url = RESTURL + "/reservations";
        var reg = /\?.*event\=([0-9]*)/;

        // lapozo adatok kezelese
        urlParams.push('_limit=' + pageLimit);
        urlParams.push('_page=' + currentPage);
        // sima szoveges kereses lekezelese
        if (searchString.length > 0) {
            urlParams.push('q=' + searchString);
        }

        // rendezes kezelese
        if (sortKey.length > 0) {
            urlParams.push('_sort=' + sortKey);
            urlParams.push('_order=' + sortDirection);
        }

        // ha van url parameter akkor osszefozzuk az url valtozoba
        if (urlParams.length > 0) {
            url = url + "?" + urlParams.join('&');
        }

        $.getJSON(url).done(
            function (reservationList, textStatus, request) {
                var oldMaxPage = maxPage;
                // valasz fejlecbol kiolvassuk az osszes lehetseges talalat szamat
                totalCount = request.getResponseHeader('X-Total-Count');
                maxPage = totalCount / pageLimit;
                // modulus (maradekos) osztas
                if (maxPage % 1 !== 0) {
                    maxPage = parseInt(maxPage) + 1;
                }
                // ha valtozott az oldalak szama akkor ujra kirajzoljuk a lapozot
                if (oldMaxPage != maxPage) {
                    renderReservationTabletPaginator();
                }

                // lapozo ertekeinek frissitese
                refreshPaginate();
                // tablazat kirajzolasa az uj adatokkal
                fillReservationsTable(reservationList);
            }
        );
    }

    function refreshPaginate() {
        var paginatorElem = $('#reservation-list-paginator');

        // bal oldali nyilacska elem referencia
        var firstElem = paginatorElem.find('ul > li:first-child');
        // jobb oldali nyilacska elem referencia
        var lastElem = paginatorElem.find('ul > li:last-child');

        if (currentPage == 1) {
            // bal oldali nyilacska tiltasa
            firstElem.addClass('disabled');

            // ha tiltva van a jobb oldali nyilacska akkor levesszuk a tiltast
            lastElem.removeClass('disabled');
        } else if (currentPage == maxPage) {
            firstElem.removeClass('disabled');
            lastElem.addClass('disabled');
        } else {
            // kozepen vagyunk a lapozoban ezert az elso es utolso elem tiltasokat elvesszuk
            firstElem.removeClass('disabled');

            lastElem.removeClass('disabled');
        }

        // Megnezzuk hogy van-e most olyan elem a paginatorban ami active
        var currentActiveElem = paginatorElem.find('ul > li.active');
        if (currentActiveElem.length > 0) {
            // ha van olyan elem akkor levesszuk rola az active class-t
            currentActiveElem.removeClass('active');
        }

        // jelenlegi oldalszamot tartalmazo li elemet megjeloljuk az active class-val
        paginatorElem.find('ul > li').eq(currentPage).addClass('active');
    }

    function renderReservationTabletPaginator() {
        var paginatorULElem = $('#reservation-list-paginator > ul');
        // mivel ujra generaljuk a lapozot, ezert elotte uritjuk
        paginatorULElem.html('');

        var html = [];
        // balra nyilacska html (nem valtoztatjuk)
        html.push('<li class="page-item"><a class="page-link" href="#" aria-label="Previous" data-paginate-size="prev"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></a></li>');

        for (var i = 1; i <= maxPage; i++) {
            // a belso elemek toltese (szam elemek)
            html.push('<li class="page-item"><a class="page-link" href="#" data-paginate-size="' + i + '">' + i + '</a></li>');
        }

        // jobbra nyilacska html (nem valtoztatjuk)
        html.push('<li class="page-item"><a class="page-link" href="#" aria-label="Next" data-paginate-size="next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>');

        // tomb osszefuzese ures szoveggel es utana az UL elem-be toltese
        paginatorULElem.html(html.join(''));
        // mivel kicsereltuk a lapozo teljes html-t igy az esemenykezeloket is ujra hozza kell adni
        bindPaginatorEvents();
    }

    /*
     * erre itt azert van szukseg mert amikor renderReservationTabletPaginator() metodus lefut
     * akkor mi toroltuk az UL -ben levo osszes elemet igy az eddig felvett click 
     * esemenyek torlodtek es ujra fel kell hogy vegyuk oket mivel renderReservationTabletPaginator() -ban 
     * teljesen ujra generaljuk a paginatorban levo LI elemeket es benne az A elemeket
    */
    function bindPaginatorEvents() {
        // Paginatorban levo gombok lekezelese
        $('#reservation-list-paginator > ul > li > a').click(
            function (event) {
                var oldCurrentPage = currentPage;
                // click esemeny megallitasa, igy nem fut le az A elemben megadott href attributum url keres
                event.preventDefault();
                // data-paginate-size kiolvasasa
                var paginateSize = $(this).data('paginate-size');
                if (paginateSize == 'prev') {
                    // ha prev gombra nyomtak akkor csokkentjuk a "globalis" currentPage erteket
                    currentPage--;
                } else if (paginateSize == 'next') {
                    // ha next gombra nyomtak akkor noveljuk a "globalis" currentPage erteket
                    currentPage++;
                } else {
                    currentPage = parseInt(paginateSize);
                }
                if (oldCurrentPage != currentPage) {
                    // lista frissitese
                    refreshReservationList();
                }
            }
        );
    }

    // keres box lekezelese
    $(".reservations-search-row input").on("keyup",
        function () {
            // feltoltjuk a "globalis" kereses szoveget tarolo valtozot
            searchString = $(this).val();
            // frissitjuk a listat
            refreshReservationList();
        });

    // rendezes lekezelese (fejlecben kattintas hatasa)
    reservationListTable.find("thead th[data-key]").on("click",
        function () {
            var th = $(this);
            $.each(reservationListTable.find('thead th[data-key]'), function (index, elem) {
                var currentTh = $(elem);
                if (th.data("key") != currentTh.data("key")) {
                    currentTh.removeClass("asc").removeClass("desc");
                }
            });
            sortKey = th.data("key");

            if (th.hasClass("asc")) {
                sortDirection = 'desc';
                th.removeClass("asc").addClass("desc");
            } else {
                sortDirection = 'asc';
                th.removeClass("desc").addClass("asc");
            }

            refreshReservationList();
        });

    // Innen indul az alkalmazas
    refreshReservationList();

    reservationListTable.on("reservationDataChanged", function () {
        refreshReservationList();
    });
});

// Kiválasztott esemény.
window.currentEvent = null;

// $("#newReservationForm").sendForm();
// Jegylista frissítése.
function refreshReservationList() {
    $("#newReservationModal").modal("hide");
    $("#reservation-list").trigger("ReservationDataChanged");
}

// function openNewReservationModal() {
//     $("#newReservationModal").modal("show");
// }

// function setEventDetails(event) {
//     $("#event").val(event.title);
//     $("#time").val(event.time);
// }
function adminReservationModal(sorszam) {

    

    $("#adminReservationModal").modal("show");

    var sor = $("tr:nth-child("+sorszam+")");
    sor.attr('style','');
    $("#modal-body1").text("Név: " + sor.find("td").eq(0).text());
    $("#modal-body2").text("Mobilszám: " + sor.find("td").eq(1).text());
    $("#modal-body3").text("E-mail: " + sor.find("td").eq(2).text());
    $("#modal-body4").text("Érkezés: " + sor.find("td").eq(3).text());
    $("#modal-body5").text("Elutazás: " + sor.find("td").eq(4).text());
    $("#modal-body6").text("Felnőttek: " + sor.find("td").eq(5).text());
    $("#modal-body7").text("Gyerekek: " + sor.find("td").eq(6).text());
    $("#modal-body8").text("Szobák: " + sor.find("td").eq(7).text());
    $("#modal-body9").text("Megjegyzés: " + sor.find("td").eq(8).text());

};



