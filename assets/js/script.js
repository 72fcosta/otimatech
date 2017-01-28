$(function() {

//nav https://www.taniarascia.com/responsive-dropdown-navigation-bar/
// If a link has a dropdown, add sub menu toggle.
    $("nav ul li a:not(:only-child)").click(function(e) {
        $(this).siblings(".nav-dropdown").toggle();
// Close one dropdown when selecting another
        $(".nav-dropdown").not($(this).siblings()).hide();
        e.stopPropagation();
    });
// Clicking away from dropdown will remove the dropdown class
    $("html").click(function() {
        $(".nav-dropdown").hide();
    });
// Toggle open and close nav styles on click
    $("#nav-toggle").click(function() {
        $("nav ul").slideToggle(400);
    });
// Hamburger to X toggle
    $("#nav-toggle").on("click", function() {
        this.classList.toggle("active");
        $(".header .header-inner").toggleClass("active");
    });

// reset erros do formulário
    $("#form-contato .form-control").click(function() {
        $("#form-contato").find(".form-group").removeClass("has-error");
        $("#form-contato").find(".help-block").remove();
    });

    $("#form-newsletter .form-control").click(function() {
        $("#form-newsletter").find(".form-group").removeClass("has-error");
        $("#form-newsletter").find(".help-block").remove();
    });

    $(".number-spinner .input-group-addon").click(function() {
        var btn = $(this),
            oldValue = btn.closest(".number-spinner").find("input").val().trim(),
            newVal = 0;

        if (btn.attr("data-dir") == "up") {
            newVal = parseInt(oldValue) + 1;
        } else {
            if (oldValue > 0) {
                newVal = parseInt(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        btn.closest(".number-spinner").find("input").val(newVal);
    });

});
