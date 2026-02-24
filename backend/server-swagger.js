const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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

// База данных пользователей (вместо товаров, как в методичке)
let users = [
    { id: nanoid(6), name: 'Петр', age: 16 },
    { id: nanoid(6), name: 'Иван', age: 18 },
    { id: nanoid(6), name: 'Дарья', age: 20 },
    { id: nanoid(6), name: 'Мария', age: 22 },
    { id: nanoid(6), name: 'Алексей', age: 25 }
];

// ========== НАСТРОЙКА SWAGGER ==========

// Описание основного API
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API управления пользователями',
            version: '1.0.0',
            description: 'Простое API для управления пользователями (CRUD)',
            contact: {
                name: 'Студент',
                email: 'student@example.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'age'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Уникальный ID пользователя',
                            example: 'abc123'
                        },
                        name: {
                            type: 'string',
                            description: 'Имя пользователя',
                            example: 'Иван Петров'
                        },
                        age: {
                            type: 'integer',
                            description: 'Возраст пользователя',
                            example: 25
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Сообщение об ошибке'
                        }
                    }
                }
            }
        }
    },
    // Путь к файлам с JSDoc-комментариями (текущий файл)
    apis: ['./server-swagger.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

/**
 * Поиск пользователя по ID
 * @param {string} id - ID пользователя
 * @param {object} res - Response объект
 * @returns {object|null} - Пользователь или null
 */
function findUserOr404(id, res) {
    const user = users.find(u => u.id === id);
    if (!user) {
        res.status(404).json({ error: "Пользователь не найден" });
        return null;
    }
    return user;
}

// ========== ДОБАВИТЬ ПРОДУКТЫ ДЛЯ ФРОНТЕНДА ==========
let products = [
    { id: nanoid(6), name: 'Ноутбук ASUS ROG', category: 'Электроника', description: 'Игровой ноутбук', price: 120000, stock: 5 },
    { id: nanoid(6), name: 'Смартфон iPhone 15', category: 'Электроника', description: '128GB', price: 89990, stock: 10 },
    { id: nanoid(6), name: 'Наушники Sony', category: 'Аксессуары', description: 'Беспроводные', price: 29990, stock: 7 },
];

// Маршрут для продуктов (для фронтенда)
app.get('/api/products', (req, res) => {
    res.json(products);
});

// ========== МАРШРУТЫ ==========

/**
 * @swagger
 * /:
 *   get:
 *     summary: Корневой маршрут
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Информация о сервере
 */
app.get('/', (req, res) => {
    res.send(`
        <h1>API управления пользователями</h1>
        <p>Сервер работает!</p>
        <p><a href="/api-docs">Документация Swagger</a></p>
        <p>Доступные маршруты:</p>
        <ul>
            <li><a href="/api/users">GET /api/users</a> - все пользователи</li>
            <li>GET /api/users/:id - пользователь по ID</li>
            <li>POST /api/users - создать пользователя</li>
            <li>PATCH /api/users/:id - обновить пользователя</li>
            <li>DELETE /api/users/:id - удалить пользователя</li>
        </ul>
    `);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Создает нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Новый пользователь"
 *               age:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/api/users", (req, res) => {
    const { name, age } = req.body;
    
    // Валидация
    if (!name || !age) {
        return res.status(400).json({ error: "Имя и возраст обязательны" });
    }

    const newUser = {
        id: nanoid(6),
        name: name.trim(),
        age: Number(age)
    };

    users.push(newUser);
    console.log(`Создан пользователь: ${newUser.name}`);
    res.status(201).json(newUser);
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Возвращает список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get("/api/users", (req, res) => {
    res.json(users);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получает пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/users/:id", (req, res) => {
    const id = req.params.id;
    const user = findUserOr404(id, res);
    if (!user) return;
    res.json(user);
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Обновляет данные пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Обновленное имя"
 *               age:
 *                 type: integer
 *                 example: 35
 *     responses:
 *       200:
 *         description: Обновленный пользователь
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Пользователь не найден
 */
app.patch("/api/users/:id", (req, res) => {
    const id = req.params.id;
    const user = findUserOr404(id, res);
    if (!user) return;

    // Проверяем, есть ли что обновлять
    if (req.body?.name === undefined && req.body?.age === undefined) {
        return res.status(400).json({ error: "Нет данных для обновления" });
    }

    const { name, age } = req.body;
    if (name !== undefined) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);

    console.log(`Обновлен пользователь: ${user.name}`);
    res.json(user);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удаляет пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       204:
 *         description: Пользователь успешно удален (нет тела ответа)
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete("/api/users/:id", (req, res) => {
    const id = req.params.id;

    const exists = users.some(u => u.id === id);
    if (!exists) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    const deletedUser = users.find(u => u.id === id);
    users = users.filter(u => u.id !== id);
    console.log(`Удален пользователь: ${deletedUser.name}`);
    res.status(204).send();
});

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Статистика по пользователям
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Статистика
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 averageAge:
 *                   type: number
 *                   example: 20.2
 */
app.get('/api/stats', (req, res) => {
    const total = users.length;
    const averageAge = users.reduce((sum, u) => sum + u.age, 0) / total;
    
    res.json({
        total,
        averageAge: Math.round(averageAge * 10) / 10
    });
});

// 404 для неизвестных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Ошибка сервера:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// Запуск сервера
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('API УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ ЗАПУЩЕНО');
    console.log('='.repeat(50));
    console.log(`Сервер: http://localhost:${port}`);
    console.log(`Документация Swagger: http://localhost:${port}/api-docs`);
    console.log(`Пользователей в базе: ${users.length}`);
    console.log('='.repeat(50));
    console.log('\nДоступные маршруты:');
    console.log('  GET    /api/users         - все пользователи');
    console.log('  GET    /api/users/:id     - пользователь по ID');
    console.log('  POST   /api/users         - создать пользователя');
    console.log('  PATCH  /api/users/:id     - обновить пользователя');
    console.log('  DELETE /api/users/:id     - удалить пользователя');
    console.log('  GET    /api/stats          - статистика');
    console.log('\n' + '='.repeat(50));
});