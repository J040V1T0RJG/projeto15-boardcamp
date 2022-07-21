import { Router } from "express";
import categoriesRouter from "./categoriesRouter";

const router = Router;

router.use(categoriesRouter);

export default router;

