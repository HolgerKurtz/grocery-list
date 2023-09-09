from flask import Flask, render_template, request, jsonify, redirect, url_for
from menumanager import MenuManager
from forms import MenuForm, IngredientForm

import os

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_APP_SECRET_KEY', 'deda3-se52ret-key')
app.config['WTF_CSRF_ENABLED'] = False

try:
    menu_manager = MenuManager('menue.json')
except FileNotFoundError as e:
    menu_manager = None
    print(e)

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
    return render_template('index.html', menus=menu_manager.menu_data.keys(), debug=app.debug)

@app.route('/get_ingredients', methods=['POST'])
def get_ingredients():
    selected_menus = request.json.get('menus', [])
    invalid_menus = [
        menu for menu in selected_menus if menu not in menu_manager.menu_data.keys()]
    if invalid_menus:
        return jsonify(error=f"Invalid menus: {', '.join(invalid_menus)}")
    ingredients, ingredientCount = get_ingredient_counts(selected_menus)
    return jsonify(ingredients=ingredients, counts=ingredientCount)

@app.route('/add_menu', methods=['GET', 'POST'])
def add_menu():
    form = MenuForm()
    if form.validate_on_submit():
        new_menu = form.name.data
        new_ingredients = form.ingredients.data.split("\n")  # Split the ingredients string into a list
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
        new_ingredients = form.ingredients.data.split('\n')  # Split the ingredients by line
        menu_manager.menu_data[menu_name] = new_ingredients
        menu_manager.save()  # Save the updated menu data
        return redirect(url_for('index'))  # Redirect to the menu overview page
    elif request.method == 'GET':
        form.name.data = menu_name
        form.ingredients.data = '\n'.join(menu_manager.menu_data[menu_name])  # Join the ingredients with newline characters
    else:
        print(form.errors)
    return render_template('update_menu.html', form=form)

if __name__ == '__main__':
    app.run(debug=True)