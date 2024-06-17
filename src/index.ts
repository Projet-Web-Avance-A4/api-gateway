import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const backendMySQLPort = process.env.BACKEND_MYSQL_PORT || 5000;
const backendMongoDBPort = process.env.BACKEND_MONGODB_PORT || 5001;
const host = process.env.HOST || 'localhost';

app.use(express.json());
app.use(helmet());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

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

app.use('/auth', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.use('/log', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.use('/order', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.use('/client', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.use('/events', (req, res) => {
    proxyMySQLRequest(req, res, req.originalUrl);
});

app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
});
