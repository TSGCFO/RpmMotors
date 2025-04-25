const { Client } = require('@replit/object-storage');
const client = new Client();
const { ok, error } = await client.uploadFromFilename('client/public/vehicles', client/public/vehicles);
    // ... handle error ...
}
