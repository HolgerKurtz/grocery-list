/**
 * Grocery List Manager
 * 
 * Main JavaScript file for handling the grocery list application
 * - Manages menu selection and ingredient display
 * - Handles shopping mode functionality
 * - Provides sharing capabilities
 */

$(document).ready(function () {
  // Constants and app configuration
  const ANIMATION_DURATION = 300; // ms - synced with config.py
  
  // Application state
  const state = {
    isShopperMode: new URLSearchParams(window.location.search).has('shopper'),
    checkedItems: new Set(),
    currentIngredients: [],
    selectedMenus: []
  };
  
  // Initialize ingredients list from DOM
  $("#ingredients-list .ingredient-name").each(function () {
    state.currentIngredients.push($(this).text().trim());
  });
  
  // Initialize based on mode
  if (state.isShopperMode) {
    initializeShopperMode();
  } else {
    initializeCreatorMode();
  }
  
  /**
   * Initialize the creator mode where users select menus and create grocery lists
   */
  function initializeCreatorMode() {
    // Restore selected menus from localStorage with error handling
    const savedMenus = loadFromLocalStorage("selectedMenus", []);
    
    // Apply saved menu selections
    savedMenus.forEach(function (menu) {
      $("#" + menu.replace(/ /g, "_")).prop("checked", true);
    });
  }
  
  /**
   * Initialize shopper mode with ingredient categorization and item management
   */
  function initializeShopperMode() {
    console.log("Initializing shopper mode with", state.currentIngredients.length, "ingredients");
    
    // Hide completion message initially
    $('#shopping-complete').hide();
    
    // Set up the shopping interface
    organizeIngredientsByCategory();
    
    // Handle item checkoff functionality
    setupItemCheckoff();
    
    // Update item count after setup
    updateItemsCount();
  }
  
  /**
   * Setup handlers for checking off items while shopping
   */
  function setupItemCheckoff() {
    // Remove any previously checked items 
    setTimeout(function() {
      $('li.checked-off').remove();
    }, 100);
    
    // Attach click handler to item checkboxes
    $("#ingredients-list").off('click', '.delete-button').on('click', '.delete-button', function() {
      const listItem = $(this).closest('li');
      
      // Skip if it's a category header
      if (listItem.hasClass('category-header')) {
        return;
      }
      
      // Get the ingredient name
      const ingredientName = listItem.find('.ingredient-name')
        .text()
        .trim()
        .replace(/\s+\d+x$/, '');
      
      // Mark as checked and animate
      console.log("Checking item:", ingredientName);
      listItem.addClass('checked-off animate__animated animate__fadeOut');
      
      // Add to checked items tracking
      state.checkedItems.add(ingredientName);
      
      // Remove item after animation completes
      setTimeout(function() {
        // Remove the item
        listItem.remove();
        
        // Clean up categories
        cleanUpEmptyCategories();
        
        // Check if we're now complete
        const remainingItems = $("#ingredients-list li").not('.category-header').not('[data-deleting=true]').length;
        
        // Update the counter
        updateItemsCount();
        
        // Force show completion if no items left
        if (remainingItems === 0) {
          console.log("Last item removed through checkoff, forcing completion message");
          showCompletionMessage();
        }
      }, ANIMATION_DURATION);
    });
  }
  
  /**
   * Organize ingredients into categories based on supermarket layout
   */
  function organizeIngredientsByCategory() {
    console.log("Organizing ingredients by category");
    
    const ingredients = state.currentIngredients;
    
    if (!ingredients || ingredients.length === 0) {
      console.log("No ingredients found");
      return;
    }
    
    // Group ingredients by category
    const categorizedIngredients = {};
    
    // First pass: categorize all ingredients
    ingredients.forEach(function (ingredient) {
      if (!ingredient) return; // Skip empty ingredients
      
      const category = categorizeIngredient(ingredient);
      
      if (!categorizedIngredients[category]) {
        categorizedIngredients[category] = [];
      }
      categorizedIngredients[category].push(ingredient);
    });
    
    // Second pass: sort ingredients within each category
    Object.keys(categorizedIngredients).forEach(function (category) {
      categorizedIngredients[category].sort();
    });
    
    // Generate HTML for the categorized list
    generateCategorizedListHTML(categorizedIngredients);
  }
  
  /**
   * Generate HTML for the categorized ingredients list
   * @param {Object} categorizedIngredients - Ingredients grouped by category
   */
  function generateCategorizedListHTML(categorizedIngredients) {
    // Sort categories by supermarket layout order
    const sortedCategories = sortCategoriesByPriority(Object.keys(categorizedIngredients));
    
    // Build the HTML
    let html = '';
    
    sortedCategories.forEach(function (category) {
      // Skip empty categories
      if (categorizedIngredients[category].length === 0) return;
      
      // Add category header
      html += '<li class="list-group-item list-group-item-secondary category-header">' +
              '<strong>' + category + '</strong>' +
              '</li>';
      
      // Add items in this category
      categorizedIngredients[category].forEach(function (ingredient) {
        if (!ingredient) return; // Skip empty ingredients
        
        const isChecked = state.checkedItems.has(ingredient);
        html += '<li class="list-group-item d-flex justify-content-between align-items-center' + 
                (isChecked ? ' checked-off' : '') + '">' +
                '<div class="ingredient-item">' +
                '<span class="ingredient-name">' + ingredient + '</span>' +
                '</div>' +
                '<button class="btn ' + (isChecked ? 'btn-secondary' : 'btn-success') + 
                ' float-right delete-button">' +
                (isChecked ? '<i class="fas fa-undo"></i>' : '<i class="fas fa-cart-plus"></i>✔') +
                '</button>' +
                '</li>';
      });
    });
    
    // Update the DOM if we have content
    if (html) {
      $("#ingredients-list").html(html);
      
      // Remove any checked items
      $('li.checked-off').remove();
    } else {
      console.log("No HTML generated for ingredients list");
    }
  }
  
  /**
   * Update the count of remaining items and handle completion
   */
  function updateItemsCount() {
    // Count visible ingredients (not headers, not being deleted)
    const visibleItems = $("#ingredients-list li").not('.category-header').not('[data-deleting=true]').length;
    
    // Update the counter display
    $('#items-remaining-count').text(visibleItems);
    
    console.log(`Items remaining: ${visibleItems}, Initial items in state: ${state.currentIngredients.length}`);
    
    // Handle shopping list completion - show message when there are no visible items left
    if (visibleItems === 0 && state.isShopperMode) {
      console.log("No items remaining, showing completion message!");
      showCompletionMessage();
    } else {
      $('#shopping-complete').hide();
    }
  }
  
  /**
   * Show the completion message and set up the celebration button
   */
  function showCompletionMessage() {
    console.log("All items checked, showing completion message");
    
    // Make sure the completion message element exists
    if ($("#shopping-complete").length === 0) {
      console.error("Could not find #shopping-complete element");
      return;
    }
    
    // Force display block style
    $('#shopping-complete').css('display', 'block !important').show();
    
    // Scroll to the completion message
    try {
      const position = $("#shopping-complete").offset().top - 100;
      $('html, body').animate({
        scrollTop: position
      }, 500);
      console.log("Scrolling to position:", position);
    } catch(e) {
      console.error("Error scrolling to completion message:", e);
    }
    
    // Set up celebration button to redirect to gif page
    $("#celebrateBtn").off('click').on('click', function(e) {
      e.preventDefault();
      console.log("Celebration button clicked, redirecting to /funny-gif");
      window.location.href = "/funny-gif";
    });
    
    // Log that the button is set up
    console.log("Celebration button handler attached to:", $("#celebrateBtn").length ? "#celebrateBtn exists" : "#celebrateBtn not found");
    
    // Add a forced visibility check after a short delay
    setTimeout(function() {
      if ($("#shopping-complete").is(":hidden")) {
        console.log("Completion message still hidden after timeout, forcing display");
        $("#shopping-complete").attr("style", "display: block !important");
      }
    }, 200);
  }

  /**
   * Fetch ingredients for selected menus from the server
   * Updates the UI with the fetched ingredients
   */
  function fetchIngredients() {
    state.selectedMenus = $(".menu-checkbox:checked")
      .map(function () {
        return $(this).val();
      })
      .get();

    // Save current selections to localStorage with error handling
    saveToLocalStorage("selectedMenus", state.selectedMenus);

    // Don't make API call if no menus selected
    if (state.selectedMenus.length === 0) {
      $("#ingredients-list").empty();
      return;
    }

    $.ajax({
      url: "/get_ingredients",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ menus: state.selectedMenus }),
      success: function (response) {
        if (response.error) {
          alert(response.error);
        } else {
          displayIngredients(response);
        }
      },
      error: function(xhr, status, error) {
        console.error("Error fetching ingredients:", error);
        alert("Could not fetch ingredients. Please try again.");
      }
    });
  }

  /**
   * Display ingredients in the UI, organized by supermarket categories
   * @param {Object} data - Object containing ingredients and their counts
   */
  function displayIngredients(data) {
    if (!data || !data.ingredients) {
      console.error("Invalid ingredient data received");
      return;
    }
    
    const ingredients = data.ingredients;
    const counts = data.counts;
    const uniqueIngredients = Object.keys(ingredients);
    
    // Update current ingredients in state
    state.currentIngredients = uniqueIngredients.sort();
    
    // If no ingredients, clear the list and return
    if (uniqueIngredients.length === 0) {
      $("#ingredients-list").empty();
      return;
    }
    
    // Categorize all ingredients
    const categorizedIngredients = {};
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
    let html = '';
    
    sortedCategories.forEach(function (category) {
      // Skip categories with no ingredients
      if (categorizedIngredients[category].length === 0) return;
      
      // Add category header
      html += '<li class="list-group-item list-group-item-secondary category-header">' +
              '<strong>' + category + '</strong>' +
              '</li>';
      
      // Add items in this category
      categorizedIngredients[category].forEach(function (ingredient) {
        const menus = ingredients[ingredient]
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

  /**
   * Handle deletion of an ingredient from the list
   * Animates the removal and cleans up empty categories
   */
  function deleteIngredient() {
    const button = $(this);
    const listItem = button.closest("li");
    
    // Only proceed if it's not a category header
    if (listItem.hasClass('category-header')) {
      return;
    }
    
    // Store references before animation
    const categoryHeader = listItem.prevAll('.category-header').first();
    const categoryId = categoryHeader.text().trim();
    
    // Mark the item as being deleted and animate
    listItem.addClass("animate__animated animate__bounceOutLeft");
    listItem.attr('data-deleting', 'true');
    
    setTimeout(() => {
      // Get the ingredient name without count suffix
      const ingredientName = cleanIngredientName(
        listItem.find(".ingredient-name").text()
      );
      
      // Update state
      state.currentIngredients = state.currentIngredients.filter(
        (ingredient) => ingredient !== ingredientName
      );
      
      // Remove the item from DOM
      listItem.remove();
      
      // Check if any items are left in this category
      const remainingItems = $("#ingredients-list li").not('.category-header').not('[data-deleting=true]').filter(function() {
        return $(this).prevAll('.category-header').first().text().trim() === categoryId;
      });
      
      // If no items remain, remove the header with animation
      if (remainingItems.length === 0) {
        categoryHeader.addClass("animate__animated animate__fadeOut");
        setTimeout(() => {
          categoryHeader.remove();
        }, ANIMATION_DURATION);
      }
      
      // Clean up any empty categories
      cleanUpEmptyCategories();

      // Check if all ingredients are gone
      const itemsLeft = $("#ingredients-list li").not('.category-header').not('[data-deleting=true]').length;
      console.log(`Remaining items after deletion: ${itemsLeft}`);
      
      if (itemsLeft === 0) {
        // All items checked off, force show completion message
        updateItemsCount();
        showCompletionMessage();
      } else {
        // Just update the count
        updateItemsCount();
      }
    }, ANIMATION_DURATION); // Use the constant for consistent timing
  }
  
  /**
   * Remove category headers that have no visible items
   * This ensures the UI stays clean when items are removed
   */
  function cleanUpEmptyCategories() {
    $('.category-header').each(function() {
      const header = $(this);
      let nextEl = header.next();
      
      // Case 1: No next element or next element is another header
      if (!nextEl.length || nextEl.hasClass('category-header')) {
        header.remove();
        return;
      }
      
      // Case 2: Check if all following items until next header are being deleted
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
    });
  }

  $(".menu-checkbox").change(fetchIngredients);
  $("#ingredients-list").on("click", ".delete-button", deleteIngredient);

  /**
   * Show a modal for sharing the grocery list
   * Generates a shareable URL containing all visible ingredients
   */
  function showShareModal() {
    // Only show share modal if we have ingredients
    if ($("#ingredients-list li").not('.category-header').not('[data-deleting=true]').length === 0) {
      alert("Please select at least one menu to create a shopping list.");
      return;
    }
    
    // Get currently visible ingredients (not deleted ones)
    const visibleIngredients = [];
    $("#ingredients-list li").not('.category-header').not('[data-deleting=true]').each(function() {
      const ingredientName = cleanIngredientName(
        $(this).find(".ingredient-name").text()
      );
      visibleIngredients.push(ingredientName);
    });
    
    // Update or use state for selected menus
    state.selectedMenus = $(".menu-checkbox:checked")
      .map(function () {
        return $(this).val();
      })
      .get();
    
    // Create shareable URL with only visible ingredients
    const baseUrl = window.location.origin + window.location.pathname;
    const shareableUrl =
      baseUrl +
      "?menus=" +
      encodeURIComponent(state.selectedMenus.join(",")) +
      "&ingredients=" +
      encodeURIComponent(visibleIngredients.join(",")) +
      "&shopper=true"; // Add shopper mode flag
      
    // Create or update share modal
    if ($("#shareModal").length === 0) {
      // Create modal if it doesn't exist
      var modalHtml = `
        <div class="modal fade" id="shareModal" tabindex="-1" role="dialog" aria-labelledby="shareModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="shareModalLabel">Share Your Grocery List</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label for="shareNote">Add a note for the shopper (optional):</label>
                  <textarea class="form-control" id="shareNote" rows="2" placeholder="e.g., Please get organic vegetables if available"></textarea>
                </div>
                <div class="form-group">
                  <label>Your list includes ${visibleIngredients.length} items from ${state.selectedMenus.length} meals</label>
                  <input type="text" class="form-control" id="shareUrl" value="${shareableUrl}" readonly>
                </div>
                <div class="alert alert-info">
                  <small>
                    <i class="fas fa-info-circle"></i> The shopper will see the list organized by supermarket sections, and can check off items while shopping.
                  </small>
                </div>
              </div>
              <div class="modal-footer">
                <div class="container">
                  <div class="row">
                    <div class="col-12 mb-2">
                      <button type="button" id="copyLinkBtn" class="btn btn-outline-primary btn-block">
                        <i class="fas fa-copy"></i> Copy Link
                      </button>
                    </div>
                    <div class="col-12">
                      <button type="button" id="shareNativeBtn" class="btn btn-primary btn-block" ${navigator.share ? '' : 'style="display:none"'}>
                        <i class="fas fa-share-alt"></i> Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      $("body").append(modalHtml);
      
      // Add event listeners to new modal buttons
      $("#copyLinkBtn").click(function() {
        const noteText = $("#shareNote").val().trim();
        let shareUrl = $("#shareUrl").val();
        
        // Add note to URL if provided
        if (noteText) {
          shareUrl += "&note=" + encodeURIComponent(noteText);
          $("#shareUrl").val(shareUrl);
        }
        
        // Use the clipboard API with proper error handling
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl)
            .then(() => {
              $("#copyLinkBtn").html('<i class="fas fa-check"></i> Copied!');
              setTimeout(() => {
                $("#copyLinkBtn").html('<i class="fas fa-copy"></i> Copy Link');
              }, 2000);
            })
            .catch(error => {
              console.error('Failed to copy:', error);
              // Fallback for copy failures
              prompt("Copy this link:", shareUrl);
            });
        } else {
          // Fallback for browsers that don't support clipboard API
          prompt("Copy this link:", shareUrl);
        }
      });
      
      $("#shareNativeBtn").click(function() {
        const noteText = $("#shareNote").val().trim();
        let shareUrl = $("#shareUrl").val();
        
        // Add note to URL if provided
        if (noteText) {
          shareUrl += "&note=" + encodeURIComponent(noteText);
        }
        
        // Use Web Share API with proper error handling
        if (navigator.share) {
          navigator.share({
            title: "Grocery List",
            text: noteText ? "Grocery list with note: " + noteText : "Check out my grocery list!",
            url: shareUrl
          })
          .then(() => {
            $('#shareModal').modal('hide');
          })
          .catch(error => {
            console.error('Error sharing:', error);
            // Usually user cancelled, no need to show error
          });
        } else {
          // Should not happen as we hide the button when share API is not available
          console.warn("Web Share API not available but button was clicked");
        }
      });
    } else {
      // Update existing modal
      $("#shareUrl").val(shareableUrl);
      $("#shareNote").val("");
      $("#shareModalLabel").text("Share Your Grocery List");
      $(".modal-body .form-group:first-child label").text(`Your list includes ${visibleIngredients.length} items from ${selectedMenus.length} meals`);
    }
    
    // Show the modal
    $('#shareModal').modal('show');
  }

  $("#generate-link-button").click(showShareModal);

  // Add this at the end of the document ready function
  $("#see-more-button").click(function () {
    $(".hidden-menu").show();
    $(this).hide();
  });
});
