import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import narrationRoutes from './routes/narrationRoutes.js'


dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())


app.use('/api/narration', narrationRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))