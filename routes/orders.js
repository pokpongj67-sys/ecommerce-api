const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM orders');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { customer_id, items } = req.body; // items: [{product_id, quantity}]
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        let total = 0;
        const orderItemsToInsert = [];

        for (const item of items) {
            // Lock the row for update to prevent race conditions
            const [products] = await connection.query(
                'SELECT price, stock FROM products WHERE id = ? FOR UPDATE', 
                [item.product_id]
            );

            if (products.length === 0) throw new Error(`Product ${item.product_id} not found`);
            if (products[0].stock < item.quantity) throw new Error(`Insufficient stock for product ${item.product_id}`);

            const itemTotal = products[0].price * item.quantity;
            total += itemTotal;

            orderItemsToInsert.push([item.product_id, item.quantity, products[0].price]);

            // Decrease stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_id, total, status) VALUES (?, ?, ?)',
            [customer_id, total, 'pending']
        );
        const orderId = orderResult.insertId;

        for (const [prodId, qty, price] of orderItemsToInsert) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, prodId, qty, price]
            );
        }

        await connection.commit();
        res.status(201).json({ order_id: orderId, total, status: 'pending' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;