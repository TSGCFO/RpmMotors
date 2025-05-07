# Deploying RPM Auto Dealership to Render.com

This guide will walk you through the process of deploying the RPM Auto Dealership application to Render.com.

## Prerequisites

1. A Render.com account
2. Git repository with your code
3. SendGrid account for email functionality

## Pre-Deployment Setup

Before deploying to Render.com, ensure your codebase is properly prepared:

1. **Environment Variables**: Copy the `.env.example` file as a reference for required environment variables
2. **Image Storage**: Review `IMAGE_STORAGE_GUIDE.md` to decide on your preferred image storage approach

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

### 2. Persistent Disk Setup (for Image Storage)

If you're using Render's disk storage for images (Option 1 in the IMAGE_STORAGE_GUIDE.md):

1. In the Render dashboard, navigate to the **Disks** section
2. Click **New Disk**
3. Configure your disk:
   - **Name**: rpm-auto-uploads
   - **Mount Path**: `/opt/render/project/src/public/uploads`
   - **Size**: Choose an appropriate size (at least 1GB recommended)
4. Click **Create Disk**

### 3. Web Service Setup

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
   - `UPLOAD_DIR`: `/opt/render/project/src/public/uploads` (if using disk storage)
   - **SendGrid configuration**:
     - `SENDGRID_API_KEY`: Your SendGrid API key
     - `EMAIL_FROM`: Your sender email address
     - `EMAIL_REPLY_TO`: Reply-to email address

6. If using AWS S3 for storage, add these environment variables:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_S3_BUCKET`: Your S3 bucket name
   - `AWS_REGION`: The AWS region of your bucket (e.g., `us-east-1`)

7. If using Cloudinary, add these environment variables:
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

8. Click **Create Web Service**

### 4. Database Migrations

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

### 5. Migrating Images from Replit

If you have vehicle images in Replit Object Storage, you'll need to migrate them to your new storage solution:

1. Download all images from your Replit application
2. Upload them to your new storage solution using the appropriate method:
   - If using Render Disk Storage: Upload to the `/opt/render/project/src/public/uploads` directory
   - If using AWS S3: Upload to your S3 bucket
   - If using Cloudinary: Upload to your Cloudinary account

See the `IMAGE_STORAGE_GUIDE.md` file for detailed instructions and example migration scripts.

### 6. Verifying Deployment

1. After deployment completes, click on the URL provided by Render
2. Verify that your application is running correctly
3. Test critical functionality:
   - Browse vehicle listings
   - Vehicle details pages with images
   - Contact forms (test sending an inquiry)
   - Admin login and dashboard

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, verify:

1. The `DATABASE_URL` environment variable is correctly set
2. The database is in the same region as your web service
3. Check logs for any connection errors
4. Try running a database migration manually via the shell to test the connection

### Missing Static Assets and Images

If images or static assets are not loading:

1. Verify your image storage configuration is correct (check `storage-adapter.ts`)
2. If using Render Disk Storage, ensure the disk is mounted correctly
3. For AWS S3 or Cloudinary, verify your credentials and bucket/cloud name
4. Check the browser console for 404 errors to identify missing assets

### Email Functionality Not Working

If email functionality is not working:

1. Verify your SendGrid API key is correct
2. Check that your sending domain is verified in SendGrid
3. Ensure the `EMAIL_FROM` address is a verified sender in your SendGrid account
4. Look for any email-related errors in the logs

### Performance Issues

If your application is slow:

1. Consider upgrading your Render plan
2. Optimize database queries
3. Consider using a CDN for static assets
4. For images, consider using a service like Cloudinary that provides automatic optimization

## Render.yaml Configuration

Instead of manual setup, you can use the provided `render.yaml` file for Blueprint deployments:

1. Push the `render.yaml` file to your Git repository
2. In the Render dashboard, click on **Blueprints**
3. Connect your repository
4. Follow the prompts to deploy all services defined in the `render.yaml` file

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

## Database Maintenance

### Backups

Render provides automatic daily backups for all PostgreSQL databases. To restore a backup:

1. Go to your database in the Render dashboard
2. Navigate to the **Backups** tab
3. Select the backup you want to restore
4. Click **Restore**

### Scaling

If you need to scale your database:

1. Go to your database in the Render dashboard
2. Navigate to the **Settings** tab
3. Under **Plan**, select a larger plan
4. Click **Update Plan**

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Render Disk Storage](https://render.com/docs/disks)
- [Custom Domains on Render](https://render.com/docs/custom-domains)
- [Render Blueprints](https://render.com/docs/blueprint-spec)