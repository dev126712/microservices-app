const express = require('express');
const redis = require('redis');
const app = express();
const PORT = 3000;

// Connect to Redis using the service name defined in docker-compose
const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:6379`
});

client.on('error', (err) => console.log('Redis Client Error', err));

app.get('/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await client.connect();
        // Check cache
        const cachedProduct = await client.get(productId);
        
        if (cachedProduct) {
            console.log("Cache Hit!");
            await client.disconnect();
            return res.json({ source: 'cache', data: JSON.parse(cachedProduct) });
        }

        // Simulate DB Fetch
        console.log("Cache Miss - Fetching from DB...");
        const product = { id: productId, name: "DevOps Tool", price: 99.99 };

        // Save to Redis for 60 seconds
        await client.setEx(productId, 60, JSON.stringify(product));
        
        await client.disconnect();
        res.json({ source: 'database', data: product });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));
