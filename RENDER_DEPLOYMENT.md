# Render Deployment Guide for RPM Auto Dealership

This guide will walk you through deploying the RPM Auto Dealership application on Render.com.

## Prerequisites

1. A Render.com account
2. Your application code in a Git repository (GitHub, GitLab, etc.)
3. Your SQL database dump file (if you want to migrate existing data)

## Step 1: Create a PostgreSQL Database on Render

1. Log in to your Render dashboard
2. Click on "New" and select "PostgreSQL"
3. Configure your database:
   - Name: `rpm-auto-db` (or your preferred name)
   - Database: `rpm_auto` (this will be your database name)
   - User: Render will generate this automatically
   - Region: Choose the region closest to your users
   - PostgreSQL Version: 15 (or newer)
4. Click "Create Database"
5. Once created, note the following information:
   - Internal Database URL
   - External Database URL
   - Database name
   - Username
   - Password

## Step 2: Migrate Your Existing Data

### Option 1: Using the SQL Dump File

If you have an existing SQL dump file containing your schema and data:

1. From the Render dashboard, navigate to your PostgreSQL service
2. Click on the "Shell" tab
3. Upload your SQL dump file using the "Upload Files" button
4. Run the following command to import your data:

```bash
psql $DATABASE_URL < your_dump_file.sql
```

### Option 2: Using Drizzle Migrations

If you prefer to use Drizzle to manage your database schema:

1. From your local environment, configure your `.env` file with the Render database URL
2. Run the following command to push your schema to the Render database:

```bash
npm run db:push
```

## Step 3: Configure Your Web Service

1. In the Render dashboard, click on "New" and select "Web Service"
2. Connect your repository from GitHub, GitLab, or Bitbucket
3. Configure your web service:
   - Name: `rpm-auto-dealership` (or your preferred name)
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Region: Choose the same region as your database
   - Plan: Select the appropriate plan for your needs

4. Set up the following environment variables:
   | Variable          | Value                                        |
   |-------------------|----------------------------------------------|
   | NODE_ENV          | production                                   |
   | DATABASE_URL      | [Your Render PostgreSQL Internal Database URL] |
   | UPLOAD_DIR        | /var/data/uploads                            |
   | PORT              | 10000 (Render's default port)                |
   | SESSION_SECRET    | [A secure random string]                     |
   | SENDGRID_API_KEY  | [Your SendGrid API Key, if using email]      |

5. Click "Create Web Service"

## Step 4: Set Up Persistent Disk for File Storage

For storing vehicle images, you'll need to add a persistent disk:

1. From your web service dashboard, go to "Settings"
2. Scroll down to "Disks" and click "Add Disk"
3. Configure your disk:
   - Name: `uploads`
   - Mount Path: `/var/data/uploads`
   - Size: Choose an appropriate size (e.g., 1 GB to start)
4. Click "Save Changes"

## Step 5: Migrate Images

Follow the detailed instructions in the `IMAGE_STORAGE_GUIDE.md` file to migrate your vehicle images from Replit to Render.

## Step 6: Verify Your Deployment

1. Wait for the deployment to complete
2. Click on the URL provided by Render to access your application
3. Verify the following functionality:
   - Homepage loads correctly
   - Vehicle listings are displayed
   - Vehicle details pages load correctly
   - Vehicle images are displayed
   - Contact form works correctly
   - Admin functionality works (if applicable)

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:

1. Verify your `DATABASE_URL` environment variable is correctly set
2. Make sure SSL is enabled for your database connection
3. Check the Render logs for specific error messages

### Images Not Displaying

If vehicle images are not displaying:

1. Follow the troubleshooting steps in the `IMAGE_STORAGE_GUIDE.md` file
2. Verify the persistent disk is properly mounted
3. Check file permissions on the uploaded files

### Application Errors

If your application has errors:

1. Check the Render logs for your web service
2. Verify all environment variables are set correctly
3. Try redeploying the application

## Best Practices

1. **Auto-Deploy**: Set up automatic deployments when you push to your repository's main branch
2. **Environment Segregation**: Consider creating separate environments for development, staging, and production
3. **Monitoring**: Set up alerts for your application's health and performance
4. **Backups**: Configure regular database backups in your Render PostgreSQL settings
5. **Security**: Regularly update your dependencies and use environment variables for sensitive information

## Additional Resources

- [Render Node.js Documentation](https://render.com/docs/deploy-node-express-app)
- [Render PostgreSQL Documentation](https://render.com/docs/databases)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Disks Documentation](https://render.com/docs/disks)