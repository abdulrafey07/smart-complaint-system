import express from "express";
import { body } from "express-validator";
import { analyzeComplaint } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { COMPLAINT_CATEGORIES } from "../models/Complaint.js";

const router = express.Router();

const analyzeComplaintValidator = [
  body("title").trim().isLength({ min: 5, max: 140 }).withMessage("Title must be between 5 and 140 characters"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 3000 })
    .withMessage("Description must be between 20 and 3000 characters"),
  body("category").isIn(COMPLAINT_CATEGORIES).withMessage("Invalid complaint category"),
  body("location.address")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 180 })
    .withMessage("Address cannot exceed 180 characters"),
  body("location.city")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 80 })
    .withMessage("City cannot exceed 80 characters"),
  body("location.state")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 80 })
    .withMessage("State cannot exceed 80 characters"),
  body("location.pincode")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 20 })
    .withMessage("Pincode cannot exceed 20 characters")
];

router.post("/analyze", protect, analyzeComplaintValidator, validateRequest, analyzeComplaint);

export default router;
