# Grocery List Julia - Development Guide

## Run Commands
- Start development server: `python3 server.py`
- Production start: `gunicorn server:app -w 1 --log-file -`
- Install dependencies: `pip install -r requirements.txt`

## Style Guidelines
- **Imports**: Group by standard library, third-party, then local imports with a blank line between groups
- **Formatting**: Follow PEP 8 guidelines with 4-space indentation
- **Naming**: 
  - Variables/functions: snake_case
  - Classes: PascalCase
  - Constants: UPPER_CASE
- **Error Handling**: Use try/except blocks with specific exception types and meaningful error messages
- **Types**: Type hints not currently used but encouraged for new code
- **Comments**: Docstrings for functions and classes; inline comments for complex logic

## Project Structure
- Flask application with JSON-based menu storage
- Templates use Jinja2 with Bootstrap (Sketchy theme)
- Frontend uses jQuery with AJAX for menu/ingredient management