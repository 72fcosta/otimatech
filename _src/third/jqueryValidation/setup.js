$(function() {
    $.validator.addMethod("tel", function(value, element) {
        return this.optional(element) || /^\(\d\d\)\s[0-9]{4}.?\-[0-9]{4}$/.test(value);
    }, "Por favor, digite um telefone válido");

    $("#form-contato").validate({
        onfocusout: false,
        rules: {
            contatoNome: {
                required: true,
                minlength: 4
            },
            contatoEmail: {
                required: true,
                email: true
            },
            contatoAssunto: {
                required: true,
                minlength: 4
            },
            contatoMensagem: {
                required: true,
                minlength: 8
            }
        },
        messages: {
            contatoNome: {
                required: "Esse campo é obrigatório",
                minlength: "Pelo menos 4 caracteres"
            },
            contatoEmail: {
                required: "Esse campo é obrigatório",
                email: "Digite um email válido"
            },
            contatoAssunto: {
                required: "Esse campo é obrigatório",
                minlength: "Pelo menos 4 caracteres"
            },
            contatoMensagem: {
                required: "Esse campo é obrigatório",
                minlength: "Pelo menos 8 caracteres"
            }
        },
        errorElement: "em",
        errorPlacement: function (error, element) {
            error.addClass("help-block");
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
        },
        unhighlight: function (element) {
            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
        }
    });

    $("#form-orcamento").validate({
        onfocusout: false,
        rules: {
            contatoNome: {
                required: true,
                minlength: 4
            },
            contatoEmail: {
                required: true,
                email: true
            },
            contatoTelefone: {
                required: true,
                tel: true
            }
        },
        messages: {
            contatoNome: {
                required: "Esse campo é obrigatório",
                minlength: "Pelo menos 4 caracteres"
            },
            contatoEmail: {
                required: "Esse campo é obrigatório",
                email: "Digite um email válido"
            },
            contatoTelefone: {
                required: "Esse campo é obrigatório",
                tel: "Telefone inválido"
            }
        },
        errorElement: "em",
        errorPlacement: function (error, element) {
            error.addClass("help-block");
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
        },
        unhighlight: function (element) {
            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
        }
    });

    $("#form-newsletter").validate({
        onfocusout: false,
        rules: {
            "signup[email]": {
                required: true,
                email: true
            }
        },
        messages: {
            "signup[email]": {
                required: "Esse campo é obrigatório",
                email: "Digite um email válido"
            }
        },
        errorElement: "em",
        errorPlacement: function (error, element) {
            error.addClass("help-block");
            $(element).parents(".form").append(error);
        },
        highlight: function (element) {
            $(element).parents(".form").addClass("has-error").removeClass("has-success");
        },
        unhighlight: function (element) {
            $(element).parents(".form").addClass("has-success").removeClass("has-error");
        }
    });
});
