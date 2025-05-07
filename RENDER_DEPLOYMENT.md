# Deploying RPM Auto Dealership to Render.com

This guide will walk you through the process of deploying the RPM Auto Dealership application to Render.com.

## Prerequisites

1. A Render.com account
2. Git repository with your code
3. SendGrid account for email functionality (if needed)

## Deployment Steps

### 1. Database Setup

1. Log in to your Render.com dashboard
2. Navigate to the **Databases** section
3. Click **New PostgreSQL** to create a new PostgreSQL database
4. Configure your database:
   - **Name**: rpm-auto-db (or your preferred name)
   - **Database**: rpm_auto
   - **User**: Choose a username
   - **Region**: Choose the region closest to your users
   - **Plan**: Select a plan that meets your needs (Starter plan is good for testing)
5. Click **Create Database**
6. Once the database is created, note down the **Internal Database URL** for the next step

### 2. Web Service Setup

1. In the Render dashboard, navigate to the **Web Services** section
2. Click **New Web Service**
3. Connect your GitHub repository
4. Configure the web service:
   - **Name**: rpm-auto-dealership (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Select a plan that meets your needs

5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your PostgreSQL connection string from step 1
   - `PORT`: `10000` (or any port Render assigns by default)
   - If using SendGrid for email functionality:
     - `SENDGRID_API_KEY`: Your SendGrid API key
     - `EMAIL_FROM`: Your sender email address
     - `EMAIL_REPLY_TO`: Reply-to email address

6. Click **Create Web Service**

### 3. Database Migrations

After deployment, you'll need to run your database migrations. There are two approaches:

#### Option 1: One-time migration via Dashboard

1. Go to your web service in the Render dashboard
2. Navigate to the **Shell** tab
3. Run the migration command: `npm run db:push`

#### Option 2: Include migrations in build process

Modify your package.json build script to include database migrations:

```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && npm run db:push"
```

### 4. Verifying Deployment

1. After deployment completes, click on the URL provided by Render
2. Verify that your application is running correctly
3. Test critical functionality like vehicle listings and contact forms

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, verify:

1. The `DATABASE_URL` environment variable is correctly set
2. The database is in the same region as your web service
3. Check logs for any connection errors

### Missing Static Assets

If static assets are not loading:

1. Check that the build process completed successfully
2. Verify the paths in your code use relative URLs

### Email Functionality Not Working

If email functionality is not working:

1. Verify your SendGrid API key is correct
2. Check that your sending domain is verified in SendGrid
3. Look for any email-related errors in the logs

## Notes About Render-Specific Features

### Auto-Deploy on Git Push

Render automatically deploys your application when you push changes to your repository. To disable this:

1. Go to your web service in the Render dashboard
2. Navigate to the **Settings** tab
3. Under **Auto-Deploy**, select **No**

### Custom Domains

To use a custom domain:

1. Go to your web service in the Render dashboard
2. Navigate to the **Settings** tab
3. Under **Custom Domains**, click **Add Custom Domain**
4. Follow the instructions to configure your domain

## Database Backups

Render provides automatic daily backups for all PostgreSQL databases. To restore a backup:

1. Go to your database in the Render dashboard
2. Navigate to the **Backups** tab
3. Select the backup you want to restore
4. Click **Restore**

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Custom Domains on Render](https://render.com/docs/custom-domains)