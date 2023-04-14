import express from 'express';
import router from './routes/enviroment.js';
import path from 'path';

import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve the static files in the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Serve the CSS file to the client
app.get('/css/styles.css', function(req, res) {
  // Set the 'Content-Type' header to 'text/css'
  res.setHeader('Content-Type', 'text/css');
  // Send the CSS file to the client
  res.sendFile(path.join(__dirname, './public/css/styles.css'));
});

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Enable JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Use the aboutRoutes for requests to the '/environment' path
app.use('/environment', router);

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
