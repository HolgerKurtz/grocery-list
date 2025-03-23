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
    
    // Update current ingredients (keep alphabetical for other uses)
    currentIngredients = uniqueIngredients.sort(); 
    
    // Categorize all ingredients
    var categorizedIngredients = {};
    uniqueIngredients.forEach(function (ingredient) {
      const category = categorizeIngredient(ingredient);
      if (!categorizedIngredients[category]) {
        categorizedIngredients[category] = [];
      }
      categorizedIngredients[category].push(ingredient);
    });
    
    // Sort ingredients alphabetically within each category
    Object.keys(categorizedIngredients).forEach(function (category) {
      categorizedIngredients[category].sort();
    });
    
    // Sort categories by supermarket order
    const sortedCategories = sortCategoriesByPriority(Object.keys(categorizedIngredients));
    
    // Build the HTML
    var html = '';
    
    sortedCategories.forEach(function (category) {
      // Add category header
      html += '<li class="list-group-item list-group-item-secondary category-header">' +
              '<strong>' + category + '</strong>' +
              '</li>';
      
      // Add items in this category
      categorizedIngredients[category].forEach(function (ingredient) {
        var menus = ingredients[ingredient]
          .map(function (menu) {
            return '<span class="badge badge-light ml-2">' + menu + "</span>";
          })
          .join("");
          
        html += '<li class="list-group-item">' +
                '<span class="ingredient-name">' +
                ingredient +
                (counts[ingredient] > 1 ? " " + counts[ingredient] + "x" : "") +
                "</span>" +
                "<i>" +
                menus +
                "</i>" +
                '<button class="btn btn-success float-right delete-button"><i class="fas fa-cart-plus"></i>✔</button>' +
                "</li>";
      });
    });
    
    $("#ingredients-list").html(html);
  }

  function deleteIngredient() {
    var button = $(this);
    var listItem = button.closest("li");
    
    // Only animate and remove if it's not a category header
    if (!listItem.hasClass('category-header')) {
      // Store references before animation
      const categoryHeader = listItem.prevAll('.category-header').first();
      const categoryId = categoryHeader.text().trim();
      
      // Mark the item as being deleted
      listItem.addClass("animate__animated animate__bounceOutLeft");
      listItem.attr('data-deleting', 'true');
      
      setTimeout(() => {
        var ingredientName = listItem.find(".ingredient-name").text().trim();
        // Remove counts if present (e.g., "Eggs 2x" -> "Eggs")
        ingredientName = ingredientName.replace(/\s+\d+x$/, '');
        
        currentIngredients = currentIngredients.filter(
          (ingredient) => ingredient !== ingredientName
        );
        
        // Remove the item
        listItem.remove();
        
        // Now check if any items are left in this category
        const remainingItems = $("#ingredients-list li").not('.category-header').not('[data-deleting=true]').filter(function() {
          // Check if this item belongs to the same category
          return $(this).prevAll('.category-header').first().text().trim() === categoryId;
        });
        
        // If no items remain, remove the header
        if (remainingItems.length === 0) {
          categoryHeader.addClass("animate__animated animate__fadeOut");
          setTimeout(() => {
            categoryHeader.remove();
          }, 500);
        }
        
        // Clean up any empty categories with no items
        cleanUpEmptyCategories();

        // Check if the ingredient list is empty and there are active checkboxes
        if (
          $("#ingredients-list li").not('.category-header').not('[data-deleting=true]').length === 0 &&
          $(".menu-checkbox:checked").length > 0
        ) {
          window.location.href = "/funny-gif"; // Redirect to the funny gif route
        }
      }, 500); // delay removal by 500ms to allow the animation to complete
    }
  }
  
  // Function to clean up empty categories
  function cleanUpEmptyCategories() {
    $('.category-header').each(function() {
      const header = $(this);
      let nextEl = header.next();
      
      // If there's no next element or the next element is another header, this category is empty
      if (!nextEl.length || nextEl.hasClass('category-header')) {
        header.remove();
      } else {
        // Check if all following items (until next header) are being deleted
        let hasVisibleItems = false;
        while (nextEl.length && !nextEl.hasClass('category-header')) {
          if (nextEl.is('li') && !nextEl.attr('data-deleting')) {
            hasVisibleItems = true;
            break;
          }
          nextEl = nextEl.next();
        }
        
        if (!hasVisibleItems) {
          header.remove();
        }
      }
    });
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
