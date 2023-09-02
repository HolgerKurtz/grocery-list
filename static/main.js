$(document).ready(function() {

    function fetchIngredients() {
        var selectedMenus = $(".menu-checkbox:checked")
            .map(function () {
                return $(this).val();
            })
            .get();
        $.ajax({
            url: "/get_ingredients",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ menus: selectedMenus }),
            success: function (response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    displayIngredients(response.ingredients);
                }
            },
        });
    }

    function displayIngredients(ingredients) {
        // Convert array to Set to remove duplicates, then convert back to array
        var uniqueIngredients = Array.from(new Set(ingredients));
        // Sort the ingredients alphabetically
        uniqueIngredients.sort();
        $("#ingredients-list").html(
            uniqueIngredients
                .map(function (ingredient) {
                    return (
                        '<li class="list-group-item">' +
                        '<span class="ingredient-name">' + ingredient + '</span>' +
                        '<button class="btn btn-danger btn-sm float-right delete-button">x</button>' +
                        '</li>'
                    );
                })
                .join("")
        );
    }

    function deleteIngredient() {
        $(this).closest('li').remove();
    }

    $(".menu-checkbox").change(fetchIngredients);
    $("#ingredients-list").on('click', '.delete-button', deleteIngredient);

});