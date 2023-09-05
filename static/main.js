$(document).ready(function () {
  var allIngredients = {};

  function fetchIngredients() {
    var menuId = $(this).val();
    var isChecked = $(this).is(":checked");

    $.ajax({
      url: "/get_ingredients",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ menus: [menuId] }),
      success: function (response) {
        if (response.error) {
          alert(response.error);
        } else {
          // Update the ingredients list for this menu
          if (isChecked) {
            allIngredients[menuId] = response.ingredients;
          } else {
            delete allIngredients[menuId];
          }

          // Combine all the ingredients into a single list
          var combinedIngredients = [].concat.apply(
            [],
            Object.values(allIngredients)
          );

          // Clear the ingredients list before displaying new ones
          $("#ingredients-list").empty();
          displayIngredients(combinedIngredients);
        }
      },
    });
  }

  function displayIngredients(ingredients) {
    // Create an object to count duplicates
    var ingredientsCount = {};
    ingredients.forEach(function (ingredient) {
      var key = String(ingredient);
      if (ingredientsCount[key]) {
        ingredientsCount[key]++;
      } else {
        ingredientsCount[key] = 1;
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
