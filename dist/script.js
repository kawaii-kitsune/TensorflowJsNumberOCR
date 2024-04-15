// Get the canvas element
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Variables to keep track of mouse movements
let painting = false;

// Event listeners to track mouse movements
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

// Functions to handle mouse movements
function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

    // Set line properties
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    // Draw line
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}
document.getElementById('predictBtn').addEventListener('click', predict);
document.getElementById('clearBtn').addEventListener('click', clearCanvas);

async function predict() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Invert the colors
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255 - imageData.data[i]; // Red
        imageData.data[i + 1] = 255 - imageData.data[i + 1]; // Green
        imageData.data[i + 2] = 255 - imageData.data[i + 2]; // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
    });

    // Create a FormData object and append the blob
    const formData = new FormData();
    formData.append('image', blob, 'digit.png');

    // Send a POST request to the server
    try {
        const response = await fetch('/tensorflow/predict', {
            method: 'POST',
            body: formData
        });

        // Parse the JSON response
        const data = await response.json();

        // Display the predicted digit
        document.getElementById('predictionResult').innerText = `${data.predictedDigit}`;
        clearCanvas();
    } catch (error) {
        console.error('Prediction failed:', error);
        document.getElementById('predictionResult').innerText = 'Prediction failed';
    }
};




// Function to clear the canvas
function clearCanvas() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // document.getElementById('predictionResult').innerHTML = ''; // Clear prediction result
}