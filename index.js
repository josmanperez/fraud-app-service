require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
let client;

async function getDb() {
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
  }
  return client.db(dbName);
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/fuzzy', async (req, res) => {
  try {
    const { pipeline, col } = req.body;
    const db = await getDb();
    const collection = db.collection(col);
    const cursor = collection.aggregate(pipeline);
    const document = await cursor.toArray();
    return res.json({ document });
  } catch (error) {
    console.error('Error retrieving document:', error);
    return res.status(500).json({ error: 'Internal Server Error', req: req.body });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on port ${port}`));
