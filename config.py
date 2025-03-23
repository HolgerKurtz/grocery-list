"""
Configuration module for Grocery List application.
Centralizes all configuration settings for easier management.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Application settings
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', 't', '1', 'yes')
PORT = int(os.environ.get('PORT', 5000))
HOST = os.environ.get('HOST', '127.0.0.1')
SECRET_KEY = os.environ.get('FLASK_APP_SECRET_KEY', 'dev-secret-key')

# File paths
MENU_FILE = os.environ.get('MENU_FILE', 'menue.json')

# External APIs
GIPHY_API_KEY = os.environ.get('GIPHY_API_KEY', '')
API_TIMEOUT = int(os.environ.get('API_TIMEOUT', 5))  # seconds

# Default assets
DEFAULT_GIF_URL = 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzhyaDM0NHRuam81Z3czZzI0cXMzN2JjOWNuamEzcm0waXZvMDZrdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/demgpwJ6rs2DS/giphy.gif'

# Application constants
ANIMATION_DURATION = 300  # milliseconds for frontend animations

# Flask configuration
FLASK_CONFIG = {
    'SECRET_KEY': SECRET_KEY,
    'WTF_CSRF_ENABLED': False,
    'JSON_SORT_KEYS': False,  # Preserve order in JSON responses
    'DEBUG': DEBUG
}