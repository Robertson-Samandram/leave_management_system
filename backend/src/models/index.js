const { Pool } = require('pg');

const pool = new Pool({
    user: 'your_username',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

const getItems = async () => {
    const res = await pool.query('SELECT * FROM items');
    return res.rows;
};

const createItem = async (item) => {
    const res = await pool.query('INSERT INTO items(name, description) VALUES($1, $2) RETURNING *', [item.name, item.description]);
    return res.rows[0];
};

const updateItem = async (id, item) => {
    const res = await pool.query('UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *', [item.name, item.description, id]);
    return res.rows[0];
};

const deleteItem = async (id) => {
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
};

module.exports = {
    getItems,
    createItem,
    updateItem,
    deleteItem,
};