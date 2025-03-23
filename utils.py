"""
Utility functions for the Grocery List application.
"""

import re
import json
import logging

logger = logging.getLogger(__name__)


def clean_ingredient_name(ingredient):
    """
    Normalize an ingredient name by removing extra whitespace and quantity suffixes

    Args:
        ingredient (str): Raw ingredient name

    Returns:
        str: Cleaned ingredient name
    """
    if not ingredient:
        return ""

    # Remove any quantity suffix like "Eggs 2x"
    cleaned = re.sub(r'\s+\d+x$', '', ingredient.strip())

    # Remove extra whitespace
    cleaned = ' '.join(cleaned.split())

    return cleaned


def parse_comma_separated_list(text):
    """
    Parse a comma-separated list of values, filtering out empty strings

    Args:
        text (str): Comma-separated text

    Returns:
        list: List of non-empty values
    """
    if not text:
        return []

    return [item.strip() for item in text.split(',') if item.strip()]


def safe_json_loads(json_str, default=None):
    """
    Safely parse a JSON string with error handling

    Args:
        json_str (str): JSON string to parse
        default (any): Default value to return if parsing fails

    Returns:
        any: Parsed JSON object or default value if parsing fails
    """
    if not json_str:
        return default

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON: {e}")
        return default
    except Exception as e:
        logger.error(f"Unexpected error parsing JSON: {e}")
        return default


def split_ingredients(ingredients_str):
    """Split a multi-line string of ingredients into a list."""
    if not ingredients_str:
        return []
    # Split by newline and strip whitespace from each ingredient
    return [i.strip() for i in ingredients_str.split("\n") if i.strip()]
