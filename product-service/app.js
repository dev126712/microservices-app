const express = require('express');
const redis = require('redis');
const app = express();
const PORT = 3000;

app.use(express.json());


// 1. Setup the Client
const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:6379`
});

// 2. CONNECT ONCE: This stays at the top, outside of any routes
client.connect()
    .then(() => console.log("✅ Connected to Redis"))
    .catch(err => console.error("❌ Redis Connection Error", err));

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// GET ALL: Pulls from the 'products' hash
app.get('/', async (req, res) => {
    try {
        const data = await client.hGetAll('products');
        const products = Object.values(data).map(p => JSON.parse(p));
        res.json(products);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET ONE: The "Cache-Aside" pattern
app.get('/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        // Look in fast cache first
        const cached = await client.get(`cache:${productId}`);
        if (cached) return res.json({ source: 'cache', data: JSON.parse(cached) });

        // If not in cache, look in main 'products' hash
        const productData = await client.hGet('products', productId);
        if (!productData) return res.status(404).send("Not Found");

        // Save to fast cache for 60 seconds before returning
        await client.setEx(`cache:${productId}`, 60, productData);
        res.json({ source: 'main_store', data: JSON.parse(productData) });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST: Add new product
app.post('/', async (req, res) => {
    const { name, price } = req.body;
    const id = Date.now().toString();
    const newProduct = { id, name, price };
    try {
        await client.hSet('products', id, JSON.stringify(newProduct));
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// PUT: Update existing product
app.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { name, price } = req.body;
    try {
        const updatedProduct = { id, name, price };
        await client.hSet('products', id, JSON.stringify(updatedProduct));
        // IMPORTANT: Delete the old cache so the update shows up immediately
        await client.del(`cache:${id}`);
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// DELETE: Remove a product
app.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Remove from main store
        const deleted = await client.hDel('products', id);
        
        if (deleted === 0) {
            return res.status(404).send("Product not found");
        }

        // IMPORTANT: Also clear the fast cache for this ID
        await client.del(`cache:${id}`);
        
        res.json({ message: "Product deleted successfully", id });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => console.log(`Product Service on port ${PORT}`));
