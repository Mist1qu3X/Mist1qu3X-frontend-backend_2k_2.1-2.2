const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 📦 Товары интернет-магазина (12 товаров)
let products = [
    { id: nanoid(6), name: 'Ноутбук ASUS ROG', category: 'Электроника', description: 'Игровой ноутбук с RTX 4060, 16GB RAM, 512GB SSD', price: 120000, stock: 5 },
    { id: nanoid(6), name: 'Смартфон iPhone 15', category: 'Электроника', description: '128GB, черный, A16 Bionic', price: 89990, stock: 10 },
    { id: nanoid(6), name: 'Наушники Sony WH-1000XM5', category: 'Аксессуары', description: 'Беспроводные, активное шумоподавление', price: 29990, stock: 7 },
    { id: nanoid(6), name: 'Книга "JavaScript для детей"', category: 'Книги', description: 'Основы программирования, 288 стр.', price: 1200, stock: 15 },
    { id: nanoid(6), name: 'Фитнес-браслет Xiaomi Mi Band 8', category: 'Электроника', description: 'Черный, AMOLED экран, пульсометр', price: 3990, stock: 20 },
    { id: nanoid(6), name: 'Рюкзак для ноутбука', category: 'Аксессуары', description: 'Водонепроницаемый, 15.6", серый', price: 4500, stock: 8 },
    { id: nanoid(6), name: 'Кофеварка DeLonghi', category: 'Для дома', description: 'Капельная, 1.25л, таймер', price: 6990, stock: 3 },
    { id: nanoid(6), name: 'Монитор LG 27" 4K', category: 'Электроника', description: 'IPS, HDR10, USB-C', price: 32990, stock: 4 },
    { id: nanoid(6), name: 'Клавиатура Logitech MX Keys', category: 'Аксессуары', description: 'Беспроводная, подсветка, для Mac/Windows', price: 11990, stock: 6 },
    { id: nanoid(6), name: 'Мышь Razer DeathAdder V2', category: 'Аксессуары', description: 'Игровая, проводная, 20000 DPI', price: 5490, stock: 12 },
    { id: nanoid(6), name: 'Внешний SSD Samsung T7 1TB', category: 'Электроника', description: 'USB 3.2, 1050MB/s, метал. корпус', price: 8990, stock: 9 },
    { id: nanoid(6), name: 'Чехол для iPhone 15', category: 'Аксессуары', description: 'Силиконовый, прозрачный, MagSafe', price: 1290, stock: 25 }
];

// 🔍 Вспомогательная функция для поиска товара
function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "Товар не найден" });
        return null;
    }
    return product;
}

// 📌 CRUD операции для товаров

// GET /api/products - получить все товары
app.get('/api/products', (req, res) => {
    res.json(products);
});

// GET /api/products/:id - получить товар по ID
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    res.json(product);
});

// POST /api/products - создать новый товар
app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock } = req.body;
    
    // Валидация
    if (!name || !category || !description || !price || stock === undefined) {
        return res.status(400).json({ error: "Все поля обязательны" });
    }

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock)
    };

    products.push(newProduct);
    console.log(`✅ Создан новый товар: ${newProduct.name} (ID: ${newProduct.id})`);
    res.status(201).json(newProduct);
});

// PATCH /api/products/:id - обновить товар
app.patch('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;

    const { name, category, description, price, stock } = req.body;
    
    // Проверяем, есть ли что обновлять
    if (!name && !category && !description && !price && stock === undefined) {
        return res.status(400).json({ error: "Нет данных для обновления" });
    }

    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (description) product.description = description.trim();
    if (price) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);

    console.log(`✅ Обновлен товар: ${product.name} (ID: ${product.id})`);
    res.json(product);
});

// DELETE /api/products/:id - удалить товар
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const exists = products.some(p => p.id === id);
    
    if (!exists) {
        return res.status(404).json({ error: "Товар не найден" });
    }

    const deletedProduct = products.find(p => p.id === id);
    products = products.filter(p => p.id !== id);
    console.log(`✅ Удален товар: ${deletedProduct.name} (ID: ${id})`);
    res.status(204).send();
});

// 📊 Статистика
app.get('/api/stats', (req, res) => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const categories = [...new Set(products.map(p => p.category))];

    res.json({
        totalProducts,
        totalStock,
        totalValue,
        categories,
        avgPrice: Math.round(totalValue / totalStock)
    });
});

// 🔍 Поиск товаров по названию или категории
app.get('/api/products/search/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const results = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
    res.json(results);
});

// Корневой маршрут
app.get('/', (req, res) => {
    res.send(`
        <h1>🛒 Интернет-магазин API</h1>
        <p>Сервер работает!</p>
        <h3>Доступные маршруты:</h3>
        <ul>
            <li><a href="/api/products">GET /api/products</a> - все товары</li>
            <li>GET /api/products/:id - товар по ID</li>
            <li>POST /api/products - создать товар</li>
            <li>PATCH /api/products/:id - обновить товар</li>
            <li>DELETE /api/products/:id - удалить товар</li>
            <li><a href="/api/stats">GET /api/stats</a> - статистика</li>
            <li>GET /api/products/search/:query - поиск</li>
        </ul>
        <p>📦 Товаров в базе: ${products.length}</p>
    `);
});

// 404 для неизвестных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("❌ Ошибка сервера:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// Запуск сервера
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🛒 ИНТЕРНЕТ-МАГАЗИН API ЗАПУЩЕН');
    console.log('='.repeat(50));
    console.log(`📍 URL: http://localhost:${port}`);
    console.log(`📦 Товаров в базе: ${products.length}`);
    console.log(`📊 Общая стоимость товаров: ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()} ₽`);
    console.log('='.repeat(50));
    console.log('\nДоступные маршруты:');
    console.log('  GET  /api/products         - все товары');
    console.log('  GET  /api/products/:id     - товар по ID');
    console.log('  POST /api/products         - создать товар');
    console.log('  PATCH /api/products/:id    - обновить товар');
    console.log('  DELETE /api/products/:id   - удалить товар');
    console.log('  GET  /api/stats            - статистика');
    console.log('  GET  /api/products/search/:query - поиск');
    console.log('\n' + '='.repeat(50));
});