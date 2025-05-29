#!/bin/bash

# Render deployment script for RPM Auto
echo "Starting deployment..."

# Run database migrations/schema push
echo "Applying database schema changes..."
npm run db:push

# Start the application
echo "Starting application..."
npm start