import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const backendMySQLPort = process.env.BACKEND_MYSQL_PORT || 5000;
const backendMongoDBPort = process.env.BACKEND_MONGODB_PORT || 5001;
const host = process.env.HOST || 'localhost';

const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007'
];

const corsOptions = {
    origin: (origin: any, callback: any) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}

app.use(express.json());
app.use(helmet());

app.use(express.json());
app.use(cors(corsOptions));

async function proxyMySQLRequest(req: any, res: any, path: any) {
    const url = `http://${host}:${backendMySQLPort}${path}`;
    const options = {
        method: req.method,
        headers: {
            ...req.headers,
            host: host,
            port: backendMySQLPort,
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error proxying request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function proxyMongoDBRequest(req: any, res: any, path: any) {
    const url = `http://${host}:${backendMongoDBPort}${path}`;
    const options = {
        method: req.method,
        headers: {
            ...req.headers,
            host: host,
            port: backendMongoDBPort,
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error proxying request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

app.use('/auth', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.use('/log', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.use('/order', (req, res) => {
    proxyMongoDBRequest(req, res, req.originalUrl);
});

app.use('/client', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.use('/events', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.use('/product', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
});
