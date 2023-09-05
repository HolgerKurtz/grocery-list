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
    // Create an object to count duplicates
    var ingredientsCount = {};
    ingredients.forEach(function (ingredient) {
      if (ingredientsCount[ingredient]) {
        ingredientsCount[ingredient]++;
      } else {
        ingredientsCount[ingredient] = 1;
      }
    });

    // Sort the ingredients alphabetically
    var sortedIngredients = Object.keys(ingredientsCount).sort();

    $("#ingredients-list").html(
      sortedIngredients
        .map(function (ingredient) {
          var count = ingredientsCount[ingredient];
          var displayText = ingredient + (count > 1 ? " " + count + "x" : "");
          return (
            '<li class="list-group-item">' +
            '<span class="ingredient-name">' +
            displayText +
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
