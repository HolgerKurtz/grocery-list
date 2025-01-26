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
            '<button class="btn btn-success float-right delete-button"><i class="fas fa-cart-plus"></i>✔</button>' +
            "</li>"
          );
        })
        .join("")
    );
  }

  function deleteIngredient() {
    var button = $(this);
    var listItem = button.closest("li");
    listItem.addClass("animate__animated animate__bounceOutLeft");
    setTimeout(() => {
      var ingredientName = listItem.find(".ingredient-name").text().trim();
      currentIngredients = currentIngredients.filter(
        (ingredient) => ingredient !== ingredientName
      );
      listItem.remove();
    }, 600); // delay removal by 800ms to allow the animation to complete
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

    if (navigator.share) {
      navigator
        .share({
          title: "Grocery List",
          text: "Check out my grocery list!",
          url: shareableUrl,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareableUrl)
        .then(() => alert("Link copied to clipboard!"))
        .catch((error) => console.log("Error copying to clipboard", error));
    } else {
      prompt("Copy this link to share your grocery list:", shareableUrl);
    }
  }

  $("#generate-link-button").click(generateShareableLink);

  // Add this at the end of the document ready function
  $("#see-more-button").click(function () {
    $(".hidden-menu").show();
    $(this).hide();
  });
});
