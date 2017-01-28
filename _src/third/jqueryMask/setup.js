$(function() {

    var maskBehavior = function(val) {
        if (val.replace(/\D/g, "").length === 11) {
            return "(00) 00000-0000";
        } else {
            return "(00) 0000-00009";
        }
    };
    var options = {
        onKeyPress: function(val, e, field, options) {
            field.mask(maskBehavior.apply({}, arguments), options);
        }
    };
    $("#contato-telefone").mask(maskBehavior, options);

});
