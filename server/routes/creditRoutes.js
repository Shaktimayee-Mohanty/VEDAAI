import express from "express"
import { getPlans,purchasePlan } from "../controllers/creditController.js"
import { protect } from "../middlewares/auth.js"

const creditRoutes=express.Router()

creditRoutes.get('/plan',getPlans)
creditRoutes.post('/purchase',protect,purchasePlan)

export default creditRoutes;