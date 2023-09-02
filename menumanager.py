import json
import os


class MenuManager:
    def __init__(self, file_path):
        self.file_path = file_path
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"The file {file_path} does not exist.")
        with open(self.file_path, 'r', encoding='utf-8') as file:
            self.menu_data = json.load(file)

    def print_all_menu_names(self):
        for menu_name in self.menu_data.keys():
            print(menu_name)

    def get_ingredients_for_menu(self, menu_name):
        return self.menu_data.get(menu_name, [])

    def add_menu(self, menu_name, ingredients):
        self.menu_data[menu_name] = ingredients
        with open(self.file_path, 'w', encoding='utf-8') as file:
            json.dump(self.menu_data, file, ensure_ascii=False)
    
    def save(self):
        with open(self.file_path, 'w') as file:
            json.dump(self.menu_data, file, indent=4)
