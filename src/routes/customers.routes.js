import { Router } from "express";
import { getCustomers, addCustomer } from "../controllers/customers.controller.js";
import schemaCustomer from "../schemas/customers.schemas.js";
import validateSchema from "../middleware/validateSchema.js";

const customerRouter = Router();

customerRouter.get("/customers", getCustomers)
customerRouter.post("/customers", validateSchema(schemaCustomer), addCustomer)


export default customerRouter;