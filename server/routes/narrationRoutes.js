import express from 'express'
import { getNarration } from '../controllers/narrationController.js'
const router = express.Router()


router.post('/', getNarration)


export default router