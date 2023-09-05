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
    var cart = $('#shopping-cart').offset();  // get the position of the shopping cart
    var item = $(this).closest("li");
    var itemOffset = item.offset();  // get the current position of the item
    item.animate({
        marginLeft: "-50%",  // move the item to the left of its current position
        opacity: 0.5  // decrease opacity for visual effect
    }, 1000, function() {
        // Once the first animation is complete, start the second animation
        item.animate({
            top: (cart.top - itemOffset.top) + "px",  // move the item to the shopping cart
            left: (cart.left - itemOffset.left) + "px",  // adjust the left position relative to the shopping cart
            opacity: 0  // fade out the item
        }, 1000, function() {
            $(this).remove();
        });
    });
}

  $(".menu-checkbox").change(fetchIngredients);
  $("#ingredients-list").on("click", ".delete-button", deleteIngredient);
});
