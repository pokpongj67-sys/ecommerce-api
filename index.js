const express = require('express');
const cors = require('cors');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'API is running' }));

// Serverless export
module.exports = app;

// Local development server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3333;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}