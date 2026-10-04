import express from "express"
import cors from "cors"
import dotenv from "dotenv"

 
const app = express()

dotenv.config()


const port = 3000||process.env.PORT
app.listen(port,()=>{
    console.log(`running on port ${port}`)
})