const express = require('express');
const bodyParser = require('body-parser');
const { put } = require('@vercel/blob');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dictionary to store generated URLs and associated data
const urlDictionary = {};

// Generate a random link function with the specified prefix
function generateRandomLink(prefix) {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `/${prefix}/${randomString}`;
}

// Handle GET request for generating a random link with data
app.get('/api/generate-link', (req, res) => {
  const { prefix, data1, data2 } = req.query;
  const generatedLink = generateRandomLink(prefix);

  // Save the generated URL and associated data in the dictionary
  urlDictionary[generatedLink] = { data1, data2 };

  res.json({ link: generatedLink, data: { data1, data2 } });
});

// Handle GET request to retrieve stored data for a specific URL
app.get('/:prefix/:randomString', (req, res) => {
  const { prefix, randomString } = req.params;
  const generatedLink = `/${prefix}/${randomString}`;

  // Check if the generated link exists in the dictionary
  if (urlDictionary[generatedLink]) {
    const { data1, data2 } = urlDictionary[generatedLink];
    res.json({ link: generatedLink, data: { data1, data2 } });
  } else {
    res.status(404).json({ error: 'URL not found' });
  }
});

// Handle POST request for avatar uploads
app.post('/api/avatar/upload', async (req, res) => {
  try {
    const filename = req.query.filename;
    const blob = await put(filename, req.body, {
      access: 'public',
    });

    res.json(blob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
