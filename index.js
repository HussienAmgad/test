const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 8080;

// Middleware لتفسير الجسم (body) كـ JSON
app.use(express.json());

const uri = "mongodb+srv://hussienamgad123:eWnRKwUqLkr2rmPZ@cluster0.fkxjm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// إضافة CORS كوسيط
app.use(cors());

// فتح اتصال MongoDB لمرة واحدة عند بدء الخادم
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// نقطة النهاية لجلب بيانات Backdoor
app.get('/', async (req, res) => {
  try {
    const database = client.db("Backdoor");
    const collection = database.collection("Backdoor");
    const Backdoor = await collection.findOne({});

    if (Backdoor) {
      res.json(Backdoor);
    } else {
      res.status(404).send("Backdoor not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// نقطة النهاية لتعديل بيانات Backdoor
app.put('/edit', async (req, res) => {
  try {
    const database = client.db("Backdoor");
    const collection = database.collection("Backdoor");
    
    // جلب المستند الحالي
    const currentBackdoor = await collection.findOne({});
    if (!currentBackdoor) {
      return res.status(404).send("Backdoor not found");
    }

    // عكس القيمة الحالية
    const updatedValue = !currentBackdoor.Backdoor; // عكس القيمة

    // تحديث المستند
    const result = await collection.updateOne({}, { $set: { Backdoor: updatedValue } });

    if (result.modifiedCount > 0) {
      // جلب المستند المحدث وإرجاعه
      const updatedDocument = await collection.findOne({});
      res.json(updatedDocument); // إرجاع القيمة المحدثة
    } else {
      res.status(404).send("No changes made or document not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
