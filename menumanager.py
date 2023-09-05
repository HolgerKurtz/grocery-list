import os
import json

class MenuManager:
    def __init__(self, file_path):
        self.file_path = file_path
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"The file {file_path} does not exist.")
        self.load_data()

    def load_data(self):
        with open(self.file_path, 'r', encoding='utf-8') as file:
            self.menu_data = json.load(file)

    def print_all_menu_names(self):
        for menu_name in self.menu_data.keys():
            print(menu_name)

    def normalize_ingredient(self, ingredient):
        return ingredient.strip()

    def get_ingredients_for_menu(self, menu_name):
        self.load_data()  # Reload the data from the file
        ingredients = self.menu_data.get(menu_name, [])
        return list(map(self.normalize_ingredient, ingredients))

    def add_menu(self, menu_name, ingredients):
        self.menu_data[menu_name] = ingredients
        self.save()

    def save(self):
        with open(self.file_path, 'w') as file:
            json.dump(self.menu_data, file, indent=4)