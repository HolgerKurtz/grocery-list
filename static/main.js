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
          displayIngredients(response); // pass the entire response object
        }
      },
    });
  }

  function displayIngredients(data) {
    var ingredients = data.ingredients;
    var counts = data.counts;
    var uniqueIngredients = Object.keys(ingredients);
    uniqueIngredients.sort();

    $("#ingredients-list").html(
      uniqueIngredients
        .map(function (ingredient) {
          var menus = ingredients[ingredient]
            .map(function (menu) {
              return '<span class="badge badge-light ml-2">' + menu + "</span>";
            })
            .join("");
          return (
            '<li class="list-group-item">' +
            '<span class="ingredient-name">' +
            ingredient +
            (counts[ingredient] > 1 ? " " + counts[ingredient] + "x" : "") +
            "</span>" +
            "<i>" +
            menus +
            "</i>" +
            '<button class="btn btn-danger btn-sm float-right delete-button">✓</button>' +
            "</li>"
          );
        })
        .join("")
    );
  }

function deleteIngredient() {
    $(this).closest("li").addClass("strikethrough");
    setTimeout(() => {
        $(this).closest("li").fadeOut('slow', function() { $(this).remove(); });
    }, 1000);  // delay removal by 1 second
}

  $(".menu-checkbox").change(fetchIngredients);
  $("#ingredients-list").on("click", ".delete-button", deleteIngredient);
});
