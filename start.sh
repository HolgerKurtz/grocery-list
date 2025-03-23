#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    set -o allexport
    source .env
    set +o allexport
    echo "Loaded environment variables from .env file"
fi

# Check if running in development or production mode
if [ "$ENV" == "production" ] || [ "$1" == "production" ]; then
    echo "Starting in production mode with gunicorn..."
    gunicorn server:app -w 2 --log-file - --access-logfile - --error-logfile - --bind ${HOST:-0.0.0.0}:${PORT:-5000}
else
    echo "Starting in development mode..."
    python3 server.py
fi