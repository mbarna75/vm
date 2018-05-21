// GoogleMaps
var parallax_map;
var big_image;
var params_url = '';

$().ready(function () {
    responsive = $(window).width();

    examples.initContactUsMap();

    if (responsive >= 768) {
        parallax_map = $('.parallax').find('.big-map');

        $(window).on('scroll', function () {
            parallax();
            gsdk.checkScrollForTransparentNavbar();
        });
    }
    var coupon = getUrlParameter('coupon');
    var ref = getUrlParameter('ref');

    has_param = 0;

    $('[rel="tooltip"]').tooltip();

    if (coupon) {
        addQSParm("coupon", coupon);
    }
    if (ref) {
        addQSParm("ref", ref);
    }

    if (coupon) {
        $('#buyButton').html('Buy now with 25% Discount');
    }

    if (ref || coupon) {
        kit_link = $(".navbar-brand").attr('href');
        $(".navbar-brand").attr('href', kit_link + params_url);

        $('.navbar-right a').each(function () {
            href = $(this).attr('href');
            if (href != '#') {
                $(this).attr('href', href + params_url);
            }
        });
    }


});

var parallax = function () {
    var current_scroll = $(this).scrollTop();

    oVal = ($(window).scrollTop() / 3);
    parallax_map.css('top', oVal);
};

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function addQSParm(name, value) {
    var re = new RegExp("([?&]" + name + "=)[^&]+", "");

    function add(sep) {
        params_url += sep + name + "=" + encodeURIComponent(value);
    }

    function change() {
        params_url = params_url.replace(re, "$1" + encodeURIComponent(value));
    }
    if (params_url.indexOf("?") === -1) {
        add("?");
    } else {
        if (re.test(params_url)) {
            change();
        } else {
            add("&");
        }
    }
}
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'assets/js/analytics.js', 'ga');

ga('create', 'UA-46172202-1', 'auto');
ga('send', 'pageview');
// End of GoogleMaps

// Weather
!function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (!d.getElementById(id)) {
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://weatherwidget.io/js/widget.min.js';
        fjs.parentNode.insertBefore(js, fjs);
    }
}(document, 'script', 'weatherwidget-io-js');
// End of Weather