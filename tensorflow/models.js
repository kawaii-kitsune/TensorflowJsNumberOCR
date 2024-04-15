const express = require('express');
const fs = require('fs');
const mnist = require('mnist');
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');

const router = express.Router();
const upload = multer({
  dest: 'uploads/'
});

function getModel() {
  const model = tf.sequential();
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const IMAGE_CHANNELS = 1;

  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
    kernelSize: 5,
    filters: 9,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));

  model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
  }));

  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));

  model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
  }));

  model.add(tf.layers.flatten());

  const NUM_OUTPUT_CLASSES = 10;
  model.add(tf.layers.dense({
    units: NUM_OUTPUT_CLASSES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax'
  }));

  const optimizer = tf.train.adam();
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}
// Load MNIST data
const set = mnist.set(8000, 2000);
const trainingSet = set.training;

// Define and compile the model
const model = getModel();
// Define model layers, compile model...

// Data preprocessing
const normalize = (data) => {
  if (!data || !Array.isArray(data)) {
    console.error("Data is undefined, null, or not an array.");
    return [];
  }
  return data.map(sample => sample.input.map(pixel => pixel / 255));
};

// Ensure data is properly initialized before using it
const trainXs = tf.stack(normalize(trainingSet));
const trainYs = tf.tensor2d(trainingSet.map(sample => sample.output));
const trainXsReshaped = trainXs.reshape([trainXs.shape[0], 28, 28, 1]);
// Ensure the shapes are correct



// Model training
model.fit(trainXsReshaped, trainYs, {
  batchSize: 28,
  epochs: 20,
  validationSplit: 0.2, // if you want to use validation data
}).then(history => {
  console.log(history.history);
}).catch(err => {
  console.error(err);
});



router.get('/', (req, res) => {
  res.sendFile(path.resolve('../views/index.html'));
});


router.post('/predict', upload.single('image'), (req, res) => {
  // console.log('Received image:', req.file);
  // Load the uploaded image
  const image = req.file;
  if (!image) {
    return res.status(400).send('No image uploaded.');
  }

  // Load the trained model
  // const model = getModel();

  // Preprocess the image
  const img = fs.readFileSync(image.path);
  // console.log('img', img);
  const decodedImage = tf.node.decodeImage(img, 1);
  // console.log('decodedImage', decodedImage);
  const resizedImage = tf.image.resizeNearestNeighbor(decodedImage, [28, 28]);
  // console.log('resizedImage', resizedImage);
  const normalizedImage = resizedImage.toFloat().div(255);
  // console.log('normalizedImage', normalizedImage);
  const inputTensor = normalizedImage.expandDims(0);
  // console.log('inputTensor', inputTensor);
  // Make prediction
  const prediction = model.predict(inputTensor);
  // console.log('prediction', prediction);
  const predictedDigit = prediction.argMax(1).dataSync()[0];
  // console.log('predictedDigit', predictedDigit);
// 
  // Dispose tensors
  decodedImage.dispose();
  resizedImage.dispose();
  normalizedImage.dispose();
  inputTensor.dispose();
  prediction.dispose();

  // Send the predicted digit as response
  res.json({"predictedDigit": predictedDigit});
});

module.exports = router;