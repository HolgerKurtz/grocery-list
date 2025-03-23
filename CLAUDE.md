# Grocery List Application

## Development Guide

### Getting Started

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
# Create a .env file with the following variables (optional)
FLASK_APP_SECRET_KEY=your_secret_key
GIPHY_API_KEY=your_giphy_api_key  # Get from https://developers.giphy.com
PORT=5000  # Default port
```

3. Run the application:
```bash
python server.py
```

### Code Structure

- `server.py`: Main Flask application with routes and API endpoints
- `menumanager.py`: Menu data management class
- `forms.py`: Flask form definitions
- `config.py`: Centralized configuration settings
- `utils.py`: Python utility functions
- `static/main.js`: Main JavaScript client code
- `static/supermarket_categories.js`: Category definitions and helper functions
- `static/grocery_utils.js`: JavaScript utility functions
- `templates/`: HTML templates

### Features

- Create and manage menus with ingredients
- Generate a grocery list based on selected menus
- Organize groceries by supermarket categories
- Share grocery lists via URL
- "Shopper mode" for people using the list in the store
- Cross-off completed items while shopping
- Celebration screen when shopping is complete

### Development Guidelines

#### Python Code Style

- Follow PEP 8 conventions
- Use docstrings for functions and classes
- Handle exceptions properly and include logging
- Use f-strings for string formatting

#### JavaScript Code Style

- Use modern JavaScript (ES6+) features
- Document functions with JSDoc comments
- Use const/let instead of var
- Use meaningful variable and function names

#### Error Handling

- Validate all user inputs
- Use try-except blocks around file operations and API calls
- Provide helpful error messages
- Log errors with appropriate severity levels

#### Data Safety

- Create backups before file writes
- Use atomic file operations when possible
- Validate JSON data after parsing

### Recommended Development Tools

- Visual Studio Code or PyCharm for editing
- Flake8 or Pylint for Python linting
- ESLint for JavaScript linting
- Browser developer tools for frontend debugging