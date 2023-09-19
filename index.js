import express from "express";
import dotenv from "dotenv";

import routerEndpoints from "./routes/routes.js";


const app = express();

dotenv.config()

const port = process.env.PORT45

app.use(express.json())

app.listen(port,()=>{
    console.log(`Server online`);
})

app.use("/EPS", routerEndpoints)

