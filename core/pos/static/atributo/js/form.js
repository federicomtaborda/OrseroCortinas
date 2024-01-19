$(function () {

    $('.select2').select2({
        theme: "bootstrap4",
        language: 'es'
    });

    $('input[name="costo"]')
    .TouchSpin({
        min: 1.00,
        max: 1000000,
        step: 1.00,
        decimals: 2,
        boostat: 5,
        verticalbuttons: true,
        maxboostedstep: 10,
        prefix: '$'
    })
    .on('keypress', function (e) {
        return validate_decimals($(this), e);
    });

});