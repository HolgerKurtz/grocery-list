from flask import Flask, render_template, request, jsonify, redirect, url_for
from menumanager import MenuManager
from forms import MenuForm
from dotenv import load_dotenv
import os
import requests


load_dotenv()
GIPHY_API_KEY = os.environ.get('GIPHY_API_KEY')
DEFAULT_GIF_URL = 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzhyaDM0NHRuam81Z3czZzI0cXMzN2JjOWNuamEzcm0waXZvMDZrdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/demgpwJ6rs2DS/giphy.gif'

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_APP_SECRET_KEY', 'deda3-se52ret-key')
app.config['WTF_CSRF_ENABLED'] = False

try:
    menu_manager = MenuManager('menue.json')
except FileNotFoundError as e:
    menu_manager = None
    app.logger.error(f"Menu file not found: {e}")


def get_ingredient_counts(selected_menus):
    ingredients = {}
    ingredientCount = {}
    for menu in selected_menus:
        for ingredient in menu_manager.get_ingredients_for_menu(menu):
            if ingredient in ingredients:
                ingredients[ingredient].append(menu)
                ingredientCount[ingredient] += 1
            else:
                ingredients[ingredient] = [menu]
                ingredientCount[ingredient] = 1
    return ingredients, ingredientCount


@app.route('/', methods=['GET'])
def index():
    if menu_manager is None:
        return "The menu file was not found. Please check the server logs for details."

    # Get menus and ingredients from query parameters
    selected_menus = request.args.get('menus', '').split(',')
    selected_ingredients = request.args.get('ingredients', '').split(',')

    # Fetch all ingredients for the selected menus
    all_ingredients, _ = get_ingredient_counts(selected_menus)

    # Filter ingredients based on selected_ingredients
    filtered_ingredients = {ingredient: all_ingredients[ingredient]
                            for ingredient in selected_ingredients if ingredient in all_ingredients}

    return render_template('index.html', menus=menu_manager.menu_data.keys(), selected_menus=selected_menus, selected_ingredients=filtered_ingredients.keys(), debug=app.debug)


@app.route('/get_ingredients', methods=['POST'])
def get_ingredients():
    selected_menus = request.json.get('menus', [])
    print("Received menus:", selected_menus)  # Debugging log
    invalid_menus = [
        menu for menu in selected_menus if menu not in menu_manager.menu_data.keys()]
    if invalid_menus:
        return jsonify(error=f"Invalid menus: {', '.join(invalid_menus)}")
    ingredients, ingredientCount = get_ingredient_counts(selected_menus)
    print("Ingredients:", ingredients)  # Debugging log
    print("Ingredient counts:", ingredientCount)  # Debugging log
    return jsonify(ingredients=ingredients, counts=ingredientCount)


def split_ingredients(ingredients_str):
    return ingredients_str.split("\n")


@app.route('/add_menu', methods=['GET', 'POST'])
def add_menu():
    form = MenuForm()
    if form.validate_on_submit():
        new_menu = form.name.data.strip()  # Strip whitespace from menu name
        new_ingredients = split_ingredients(form.ingredients.data)
        if new_menu in menu_manager.menu_data:
            return "This menu already exists. Please choose a different name."
        menu_manager.menu_data[new_menu] = new_ingredients
        menu_manager.save()  # Save the updated menu data
        return redirect(url_for('index'))
    return render_template('add_menu.html', form=form)


@app.route('/update_menu/<menu_name>', methods=['GET', 'POST'])
def update_menu(menu_name):
    if menu_name not in menu_manager.menu_data:
        return "This menu does not exist."
    form = MenuForm()
    if form.validate_on_submit():
        new_ingredients = split_ingredients(form.ingredients.data)
        menu_manager.menu_data[menu_name] = new_ingredients
        menu_manager.save()  # Save the updated menu data
        return redirect(url_for('index'))  # Redirect to the menu overview page
    elif request.method == 'GET':
        form.name.data = menu_name
        # Join the ingredients with newline characters
        form.ingredients.data = '\n'.join(menu_manager.menu_data[menu_name])
    else:
        print(form.errors)
    return render_template('update_menu.html', form=form)


@app.route('/funny-gif', methods=['GET'])
def funny_gif():
    # Initially render with a placeholder GIF or a fast-loading static GIF
    return render_template('funny_gif.html', gif_url=DEFAULT_GIF_URL, default_gif_url=DEFAULT_GIF_URL)

@app.route('/api/get-random-gif', methods=['GET'])
def get_random_gif():
    # Fetch a random cooking gif from Giphy
    try:
        response = requests.get(
            'https://api.giphy.com/v1/gifs/random',
            params={
                'api_key': GIPHY_API_KEY,
                'tag': 'cooking',
                'rating': 'G'
            }
        )
        data = response.json()
        gif_url = data['data']['images']['original']['url']
    except Exception as e:
        app.logger.error(f"Error fetching Giphy data: {e}")
        gif_url = DEFAULT_GIF_URL

    return jsonify({'gif_url': gif_url})


if __name__ == '__main__':
    app.run(debug=True)
