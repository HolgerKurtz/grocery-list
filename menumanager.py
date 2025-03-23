import os
import json
import logging
import utils

logger = logging.getLogger(__name__)

class MenuManager:
    """Manages menu data including loading, saving, and retrieving ingredients."""
    
    def __init__(self, file_path):
        """Initialize the MenuManager with a JSON file path.
        
        Args:
            file_path (str): Path to the JSON file containing menu data
            
        Raises:
            FileNotFoundError: If the file doesn't exist
        """
        self.file_path = file_path
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"The file {file_path} does not exist.")
        self.load_data()

    def load_data(self):
        """Load menu data from the JSON file."""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
                # Check for empty file
                if not content.strip():
                    logger.warning(f"Empty menu file: {self.file_path}")
                    self.menu_data = {}
                    return
                    
                # Parse JSON
                self.menu_data = json.loads(content)
                
                # Validate data structure
                if not isinstance(self.menu_data, dict):
                    logger.error("Menu data is not a dictionary, resetting to empty data")
                    self.menu_data = {}
                    return
                    
            logger.debug(f"Loaded {len(self.menu_data)} menus from {self.file_path}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing menu JSON: {e}")
            # Provide empty data rather than crashing
            self.menu_data = {}
        except Exception as e:
            logger.error(f"Unexpected error loading menu data: {e}")
            self.menu_data = {}

    def get_menu_names(self):
        """Get a list of all menu names.
        
        Returns:
            list: All menu names
        """
        return list(self.menu_data.keys())

    def normalize_ingredient(self, ingredient):
        """Clean up an ingredient string by removing whitespace.
        
        Args:
            ingredient (str): Raw ingredient string
            
        Returns:
            str: Normalized ingredient string
        """
        return utils.clean_ingredient_name(ingredient)

    def get_ingredients_for_menu(self, menu_name):
        """Get all ingredients for a specific menu.
        
        Args:
            menu_name (str): Name of the menu
            
        Returns:
            list: List of normalized ingredients
        """
        if menu_name not in self.menu_data:
            logger.warning(f"Requested ingredients for unknown menu: {menu_name}")
            return []
            
        # Get ingredients for the menu and normalize them
        ingredients = self.menu_data.get(menu_name, [])
        return [self.normalize_ingredient(i) for i in ingredients if self.normalize_ingredient(i)]

    def add_menu(self, menu_name, ingredients):
        """Add a new menu with ingredients.
        
        Args:
            menu_name (str): Name of the menu to add
            ingredients (list): List of ingredients
        """
        # Normalize all ingredients to ensure consistent data
        normalized_ingredients = [self.normalize_ingredient(i) for i in ingredients]
        # Filter out any empty strings
        normalized_ingredients = [i for i in normalized_ingredients if i]
        
        self.menu_data[menu_name] = normalized_ingredients
        self.save()
        logger.info(f"Added menu '{menu_name}' with {len(normalized_ingredients)} ingredients")

    def save(self):
        """Save current menu data to the JSON file."""
        if not self.menu_data:
            logger.warning("Attempted to save empty menu data")
            
        # Create a backup of the original file first
        try:
            if os.path.exists(self.file_path):
                backup_path = f"{self.file_path}.bak"
                with open(self.file_path, 'r', encoding='utf-8') as src, \
                     open(backup_path, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
                logger.debug(f"Created backup of menu data at {backup_path}")
        except Exception as e:
            logger.warning(f"Failed to create backup before saving: {e}")
            
        # Save the current data
        try:
            # Use a temp file and then rename to avoid data corruption if interrupted
            temp_path = f"{self.file_path}.tmp"
            with open(temp_path, 'w', encoding='utf-8') as file:
                json.dump(self.menu_data, file, indent=4, ensure_ascii=False)
                
            # Ensure data is written to disk before renaming
            os.replace(temp_path, self.file_path)
            logger.debug(f"Saved {len(self.menu_data)} menus to {self.file_path}")
            
        except Exception as e:
            logger.error(f"Error saving menu data: {e}")
            raise