$(document).ready(function () {
  // Restore selected menus from localStorage
  var savedMenus = JSON.parse(localStorage.getItem("selectedMenus")) || [];
  console.log("Restoring menus:", savedMenus);
  savedMenus.forEach(function (menu) {
    $("#" + menu.replace(/ /g, "_")).prop("checked", true);
  });

  // Initialize current ingredients from server-rendered data
  var currentIngredients = [];
  $("#ingredients-list .ingredient-name").each(function () {
    currentIngredients.push($(this).text().trim());
  });

  function fetchIngredients() {
    var selectedMenus = $(".menu-checkbox:checked")
      .map(function () {
        return $(this).val();
      })
      .get();

    console.log("Selected menus:", selectedMenus); // Debugging log

    // Save current selections to localStorage
    localStorage.setItem("selectedMenus", JSON.stringify(selectedMenus));

    $.ajax({
      url: "/get_ingredients",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ menus: selectedMenus }),
      success: function (response) {
        if (response.error) {
          alert(response.error);
        } else {
          displayIngredients(response);
        }
      },
    });
  }

  function displayIngredients(data) {
    var ingredients = data.ingredients;
    var counts = data.counts;
    var uniqueIngredients = Object.keys(ingredients);
    uniqueIngredients.sort();

    currentIngredients = uniqueIngredients; // Update current ingredients

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
    var button = $(this);
    button.addClass("wiggle");
    setTimeout(() => {
      var ingredientName = button
        .closest("li")
        .find(".ingredient-name")
        .text()
        .trim();
      currentIngredients = currentIngredients.filter(
        (ingredient) => ingredient !== ingredientName
      );
      button.closest("li").remove();
    }, 800); // delay removal by 800ms to allow the animation to complete
  }

  $(".menu-checkbox").change(fetchIngredients);
  $("#ingredients-list").on("click", ".delete-button", deleteIngredient);

  function generateShareableLink() {
    var selectedMenus = $(".menu-checkbox:checked")
      .map(function () {
        return $(this).val();
      })
      .get();

    var baseUrl = window.location.origin + window.location.pathname;
    var shareableUrl =
      baseUrl +
      "?menus=" +
      encodeURIComponent(selectedMenus.join(",")) +
      "&ingredients=" +
      encodeURIComponent(currentIngredients.join(","));
    prompt("Copy this link to share your grocery list:", shareableUrl);
  }

  $("#generate-link-button").click(generateShareableLink);
});
