# Image Storage Migration Guide for Render Deployment

This guide will help you migrate vehicle images from your Replit application to your Render deployment.

## Understanding Image Storage in Different Environments

### Replit
In the Replit environment, images were stored using Replit's Object Storage feature, which provides a cloud-based storage solution.

### Render
For Render deployment, images are stored in the filesystem at the path `/var/data/uploads` (configured through the `UPLOAD_DIR` environment variable).

## Migration Process

### Option 1: Manual Migration (Most Reliable)

1. Download all images from your Replit application's Object Storage.
2. Create a ZIP file containing all these images organized in the same folder structure.
3. In the Render dashboard, go to your web service and select the "Shell" tab.
4. Upload the ZIP file using the "Upload Files" button.
5. Extract the ZIP file to the uploads directory:

```bash
mkdir -p /var/data/uploads
unzip your-images.zip -d /var/data/uploads
chmod -R 755 /var/data/uploads
```

### Option 2: Automated Migration Script

You can run the following script in the Render Shell to download images directly from your Replit application:

```bash
#!/bin/bash
# Replace with your Replit app URL
REPLIT_APP_URL="https://your-replit-app.replit.app"
VEHICLE_IDS=$(curl "$REPLIT_APP_URL/api/vehicles" | jq -r '.[].id')

mkdir -p /var/data/uploads/vehicles

for id in $VEHICLE_IDS; do
  echo "Processing vehicle ID: $id"
  vehicle_data=$(curl "$REPLIT_APP_URL/api/vehicles/$id")
  
  # Extract image URLs
  main_image=$(echo $vehicle_data | jq -r '.mainImage')
  gallery_images=$(echo $vehicle_data | jq -r '.galleryImages[]?')
  
  # Download main image
  if [[ $main_image != "null" && $main_image != "" ]]; then
    filename=$(basename "$main_image")
    echo "Downloading main image: $filename"
    curl -s "$REPLIT_APP_URL$main_image" -o "/var/data/uploads/vehicles/$filename"
  fi
  
  # Download gallery images
  for img in $gallery_images; do
    if [[ $img != "null" && $img != "" ]]; then
      filename=$(basename "$img")
      echo "Downloading gallery image: $filename"
      curl -s "$REPLIT_APP_URL$img" -o "/var/data/uploads/vehicles/$filename"
    fi
  done
done

echo "Image migration complete!"
chmod -R 755 /var/data/uploads
```

## Verifying the Migration

After migrating images, verify that they are accessible through your application:

1. Visit your Render application URL
2. Navigate to the inventory page
3. Check that vehicle images are displaying correctly
4. If images are missing, check the console for errors and verify the image paths in the database

## Environment Variable Configuration

Make sure the following environment variables are set in your Render dashboard:

| Variable   | Purpose                                     | Example Value        |
|------------|---------------------------------------------|----------------------|
| UPLOAD_DIR | Directory where uploaded files are stored   | /var/data/uploads    |
| NODE_ENV   | Environment setting (should be production)  | production           |

## Troubleshooting

### Images Not Displaying

1. Check the browser developer console for 404 errors on image URLs
2. Verify that images exist in the `/var/data/uploads` directory
3. Ensure the static file middleware is correctly configured
4. Verify file permissions (should be 755 for directories and 644 for files)

### Database Image Paths

If your database contains absolute URLs to the old storage location, you may need to update them:

```sql
UPDATE vehicles 
SET mainImage = REPLACE(mainImage, 'https://old-url.com', '')
WHERE mainImage LIKE 'https://old-url.com%';

UPDATE vehicles 
SET galleryImages = ARRAY_REPLACE(galleryImages, 'https://old-url.com%', '')
WHERE galleryImages IS NOT NULL;
```

## Additional Resources

- [Render File Uploads Documentation](https://render.com/docs/disks)
- [Render Environment Variables](https://render.com/docs/environment-variables)