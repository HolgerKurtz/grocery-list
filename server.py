from flask import Flask, render_template, request, jsonify, redirect, url_for
from menumanager import MenuManager
from forms import MenuForm
import os
import requests
import logging
import config
import utils

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
for key, value in config.FLASK_CONFIG.items():
    app.config[key] = value

# Initialize menu manager
try:
    menu_manager = MenuManager(config.MENU_FILE)
    logger.info(f"Successfully loaded menu data from {config.MENU_FILE}")
except FileNotFoundError as e:
    menu_manager = None
    logger.error(f"Menu file not found: {e}")
except Exception as e:
    menu_manager = None
    logger.error(f"Error initializing menu manager: {e}")


def get_ingredient_counts(selected_menus):
    """
    Calculate ingredients and their counts from selected menus.
    
    Args:
        selected_menus (list): List of menu names to process
        
    Returns:
        tuple: (ingredients_dict, count_dict) where:
            - ingredients_dict: Maps each ingredient to the menus it appears in
            - count_dict: Maps each ingredient to its occurrence count
    """
    ingredients = {}
    ingredient_count = {}
    
    for menu in selected_menus:
        for ingredient in menu_manager.get_ingredients_for_menu(menu):
            if ingredient in ingredients:
                ingredients[ingredient].append(menu)
                ingredient_count[ingredient] += 1
            else:
                ingredients[ingredient] = [menu]
                ingredient_count[ingredient] = 1
                
    return ingredients, ingredient_count


@app.route('/', methods=['GET'])
def index():
    """Main route that displays the grocery list interface."""
    if menu_manager is None:
        logger.error("Menu manager not initialized")
        return "The menu file was not found. Please check the server logs for details."

    # Parse and validate query parameters using utility functions
    selected_menus = utils.parse_comma_separated_list(request.args.get('menus', ''))
    selected_ingredients = utils.parse_comma_separated_list(request.args.get('ingredients', ''))
        
    # Parse boolean parameters
    shopper_mode = request.args.get('shopper', 'false').lower() in ('true', 't', '1', 'yes')
    
    # Get optional note
    note = request.args.get('note', '')
    
    # Fetch ingredients data
    all_ingredients, _ = get_ingredient_counts(selected_menus)

    # Filter ingredients based on selected_ingredients
    filtered_ingredients = {
        ingredient: all_ingredients[ingredient]
        for ingredient in selected_ingredients 
        if ingredient in all_ingredients
    }

    logger.info(f"Rendering index with {len(selected_menus)} menus and {len(filtered_ingredients)} ingredients")
    
    # Render the template with all necessary data
    return render_template(
        'index.html', 
        menus=menu_manager.menu_data.keys(), 
        selected_menus=selected_menus, 
        selected_ingredients=filtered_ingredients.keys(), 
        shopper_mode=shopper_mode,
        note=note,
        debug=app.debug
    )


@app.route('/get_ingredients', methods=['POST'])
def get_ingredients():
    """API endpoint to get ingredients for selected menus."""
    selected_menus = request.json.get('menus', [])
    logger.info(f"Received request for ingredients with {len(selected_menus)} menus")
    
    # Validate menus
    invalid_menus = [
        menu for menu in selected_menus 
        if menu not in menu_manager.menu_data.keys()
    ]
    
    if invalid_menus:
        error_msg = f"Invalid menus: {', '.join(invalid_menus)}"
        logger.warning(error_msg)
        return jsonify(error=error_msg)
    
    # Get ingredients and counts
    ingredients, ingredient_count = get_ingredient_counts(selected_menus)
    
    logger.info(f"Returning {len(ingredients)} ingredients")
    return jsonify(ingredients=ingredients, counts=ingredient_count)


def split_ingredients(ingredients_str):
    """Split a multi-line string of ingredients into a list."""
    if not ingredients_str:
        return []
    # Split by newline and strip whitespace from each ingredient
    return [i.strip() for i in ingredients_str.split("\n") if i.strip()]  


@app.route('/add_menu', methods=['GET', 'POST'])
def add_menu():
    """Add a new menu with ingredients."""
    form = MenuForm()
    
    if form.validate_on_submit():
        new_menu = form.name.data.strip()  # Strip whitespace from menu name
        new_ingredients = split_ingredients(form.ingredients.data)
        
        if not new_menu:
            logger.warning("Attempted to add menu with empty name")
            return "Menu name cannot be empty."
            
        if not new_ingredients:
            logger.warning(f"Attempted to add menu '{new_menu}' with no ingredients")
            return "You must add at least one ingredient."
        
        if new_menu in menu_manager.menu_data:
            logger.warning(f"Attempted to add duplicate menu: {new_menu}")
            return "This menu already exists. Please choose a different name."
            
        # Add the menu and save to file
        menu_manager.add_menu(new_menu, new_ingredients)
        logger.info(f"Added new menu '{new_menu}' with {len(new_ingredients)} ingredients")
        
        return redirect(url_for('index'))
        
    return render_template('add_menu.html', form=form)


@app.route('/update_menu/<menu_name>', methods=['GET', 'POST'])
def update_menu(menu_name):
    """Update an existing menu's ingredients."""
    if menu_name not in menu_manager.menu_data:
        logger.warning(f"Attempted to update non-existent menu: {menu_name}")
        return "This menu does not exist."
        
    form = MenuForm()
    
    if form.validate_on_submit():
        new_ingredients = split_ingredients(form.ingredients.data)
        
        if not new_ingredients:
            logger.warning(f"Attempted to update menu '{menu_name}' with no ingredients")
            return "You must add at least one ingredient."
            
        # Update the menu and save to file
        menu_manager.menu_data[menu_name] = new_ingredients
        menu_manager.save()
        
        logger.info(f"Updated menu '{menu_name}' with {len(new_ingredients)} ingredients")
        return redirect(url_for('index'))
        
    elif request.method == 'GET':
        # Pre-populate form with existing data
        form.name.data = menu_name
        form.ingredients.data = '\n'.join(menu_manager.menu_data[menu_name])
    else:
        logger.warning(f"Form validation errors: {form.errors}")
        
    return render_template('update_menu.html', form=form)


@app.route('/funny-gif', methods=['GET'])
def funny_gif():
    """Display the celebration page with a GIF when shopping is complete."""
    logger.info("Showing celebration GIF page")
    return render_template('funny_gif.html', 
                          gif_url=config.DEFAULT_GIF_URL, 
                          default_gif_url=config.DEFAULT_GIF_URL)


@app.route('/api/get-random-gif', methods=['GET'])
def get_random_gif():
    """API endpoint to fetch a random cooking GIF from Giphy."""
    if not config.GIPHY_API_KEY:
        logger.warning("GIPHY_API_KEY is not set. Using default GIF.")
        return jsonify({'gif_url': config.DEFAULT_GIF_URL})
        
    try:
        # Use session for connection pooling
        session = requests.Session()
        response = session.get(
            'https://api.giphy.com/v1/gifs/random',
            params={
                'api_key': config.GIPHY_API_KEY,
                'tag': 'cooking',
                'rating': 'G'
            },
            timeout=config.API_TIMEOUT
        )
        response.raise_for_status()  # Raise exception for 4xx/5xx responses
        
        data = response.json()
        
        # Get a medium-sized GIF for better performance
        # The 'downsized' version is smaller and loads faster than 'original'
        gif_url = data['data']['images'].get('downsized', {}).get('url')
        
        # Fallback to original if downsized not available
        if not gif_url:
            gif_url = data['data']['images']['original']['url']
            
        logger.info("Successfully fetched random GIF from Giphy")
        
    except requests.RequestException as e:
        logger.error(f"Request error fetching Giphy data: {e}")
        gif_url = config.DEFAULT_GIF_URL
    except (KeyError, ValueError, TypeError) as e:
        logger.error(f"Error parsing Giphy response: {e}")
        gif_url = config.DEFAULT_GIF_URL
    except Exception as e:
        logger.error(f"Unexpected error fetching Giphy data: {e}")
        gif_url = config.DEFAULT_GIF_URL

    return jsonify({
        'gif_url': gif_url, 
        'default_gif_url': config.DEFAULT_GIF_URL
    })


if __name__ == '__main__':
    app.run(
        debug=config.DEBUG,
        host=config.HOST,
        port=config.PORT
    )
