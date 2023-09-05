$(document).ready(function () {
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
    var ingredientCount = {};
    ingredients.forEach(function (i) {
      ingredientCount[i] = (ingredientCount[i] || 0) + 1;
    });

    var uniqueIngredients = Object.keys(ingredientCount);
    uniqueIngredients.sort();

    $("#ingredients-list").html(
      uniqueIngredients
        .map(function (ingredient) {
          return (
            '<li class="list-group-item">' +
            '<span class="ingredient-name">' +
            ingredient +
            (ingredientCount[ingredient] > 1
              ? " " + ingredientCount[ingredient] + "x"
              : "") +
            "</span>" +
            '<button class="btn btn-danger btn-sm float-right delete-button">✓</button>' +
            "</li>"
          );
        })
        .join("")
    );
  }

  function deleteIngredient() {
    $(this).closest("li").remove();
  }

  $(".menu-checkbox").change(fetchIngredients);
  $("#ingredients-list").on("click", ".delete-button", deleteIngredient);
});
