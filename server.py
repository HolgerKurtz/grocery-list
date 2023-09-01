from flask import Flask, render_template, request, jsonify, redirect, url_for
from menumanager import MenuManager
from forms import MenuForm, IngredientForm

app = Flask(__name__)
app.secret_key = 'hhidfh-23hih-hi234'

try:
    menu_manager = MenuManager('menue.json')
except FileNotFoundError as e:
    menu_manager = None
    print(e)


@app.route('/', methods=['GET'])
def index():
    if menu_manager is None:
        return "The menu file was not found. Please check the server logs for details."
    return render_template('index.html', menus=menu_manager.menu_data.keys())


@app.route('/get_ingredients', methods=['POST'])
def get_ingredients():
    selected_menus = request.json.get('menus', [])
    invalid_menus = [
        menu for menu in selected_menus if menu not in menu_manager.menu_data.keys()]
    if invalid_menus:
        return jsonify(error=f"Invalid menus: {', '.join(invalid_menus)}")
    ingredients = set()
    for menu in selected_menus:
        ingredients.update(menu_manager.get_ingredients_for_menu(menu))
    return jsonify(ingredients=list(ingredients))

@app.route('/add_menu', methods=['GET', 'POST'])
def add_menu():
    form = MenuForm()
    if form.validate_on_submit():
        new_menu = form.name.data
        new_ingredients = form.ingredients.data
        if new_menu in menu_manager.menu_data:
            return "This menu already exists. Please choose a different name."
        menu_manager.menu_data[new_menu] = new_ingredients
        return redirect(url_for('index'))
    return render_template('add_menu.html', form=form)
  
@app.route('/update_menu/<menu_name>', methods=['GET', 'POST'])
def update_menu(menu_name):
    if menu_name not in menu_manager.menu_data:
        return "This menu does not exist."
    form = MenuForm()
    if form.validate_on_submit():
        new_ingredients = [ingredient_form for ingredient_form in form.ingredients.entries]
        menu_manager.menu_data[menu_name] = new_ingredients
        return redirect(url_for('index'))  # Redirect to the menu overview page
    elif request.method == 'GET':
        form.name.data = menu_name
        for ingredient in menu_manager.menu_data[menu_name]:
            ingredient_form = IngredientForm()
            ingredient_form.name.data = ingredient
            form.ingredients.append_entry(ingredient_form)
        form.ingredients.append_entry(IngredientForm())  # append an empty form
    return render_template('update_menu.html', form=form)

if __name__ == '__main__':
    app.run(debug=True)
