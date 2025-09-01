import express from 'express';
import {port} from './config.ts';
import cors from "cors";
import router from './routes/index.ts';

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(port,()=>{
    console.log(`server is listening on port: ${port}`);
})
