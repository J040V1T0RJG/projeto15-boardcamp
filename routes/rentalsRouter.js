import { Router } from "express";
import { getRentals, postRentals, postRentalsId, deleteRentals } from "../controllers/rentalsController.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals", postRentals);
rentalsRouter.post("/rentals/:id/return", postRentalsId);
rentalsRouter.delete("/rentals/:id", deleteRentals);

export default rentalsRouter;