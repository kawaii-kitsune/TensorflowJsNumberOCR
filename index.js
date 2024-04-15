const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Import routes
const nst= require('./tensorflow/models'); 
const nodemailer = require('nodemailer');

const path = require('path');
// Create Express application
require('dotenv').config(); 
const app = express();
const port = process.env.PORT || 3000;
// Serve static files from 'dist' directory
app.use('/static',express.static('dist'));
app.use('/model',express.static('tensorflow/models/tfjs_vgg19_imagenet/model'));
// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Parse JSON requests

// Routes
app.use('/', routes); // Use routes defined in routes/index.js
app.use('/tensorflow', nst); 
 // Use routes defined in routes/index.js

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
// POST endpoint to handle form submission
// app.post('/contact', (req, res) => {
//     const { name, email, message } = req.body;

//     // Create reusable transporter object using the default SMTP transport
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.GMAIL_USER, // Gmail address loaded from .env
//             pass: process.env.GMAIL_PASS // Gmail password loaded from .env
//         }
//     });

//     // Email message configuration
//     const mailOptions = {
//         from: email,
//         to: 'recipient_email@example.com', // Your email address
//         subject: `Message from ${name}`,
//         text: message
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error(error);
//             res.status(500).send('Error: Failed to send message');
//         } else {
//             console.log('Email sent: ' + info.response);
//             res.status(200).send('Message sent successfully');
//         }
//     });
// });
const uploadFolderPath = path.join(__dirname, 'uploads');

// Function to clear the upload folder
function clearUploadFolder() {
    fs.readdir(uploadFolderPath, (err, files) => {
        if (err) {
            console.error('Error reading upload folder:', err);
            return;
        }
        files.forEach(file => {
            const filePath = path.join(uploadFolderPath, file);
            fs.unlink(filePath, err => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted successfully:', file);
                }
            });
        });
    });
}

// Interval in milliseconds (e.g., 24 hours)
const interval = 24 * 60 * 60 * 1000;

// Schedule the clearing process at regular intervals
setInterval(clearUploadFolder, interval);
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
