import { body, param, query } from "express-validator";
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from "../models/Complaint.js";

export const complaintIdValidator = [param("id").isMongoId().withMessage("Invalid complaint id")];

export const complaintQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive number"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("category").optional().isIn(COMPLAINT_CATEGORIES).withMessage("Invalid category"),
  query("status").optional().isIn(COMPLAINT_STATUSES).withMessage("Invalid status"),
  query("location").optional().trim().isLength({ max: 120 }).withMessage("Location search is too long"),
  query("q").optional().trim().isLength({ max: 120 }).withMessage("Search term is too long")
];

export const locationSearchValidator = [
  query("location")
    .trim()
    .notEmpty()
    .withMessage("Location search value is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Location search must be between 2 and 120 characters"),
  query("category").optional().isIn(COMPLAINT_CATEGORIES).withMessage("Invalid category"),
  query("status").optional().isIn(COMPLAINT_STATUSES).withMessage("Invalid status"),
  query("q").optional().trim().isLength({ max: 120 }).withMessage("Search term is too long"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive number"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100")
];

export const createComplaintValidator = [
  body("title").trim().isLength({ min: 5, max: 140 }).withMessage("Title must be between 5 and 140 characters"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 3000 })
    .withMessage("Description must be between 20 and 3000 characters"),
  body("category").isIn(COMPLAINT_CATEGORIES).withMessage("Invalid complaint category"),
  body("location.address")
    .trim()
    .isLength({ min: 3, max: 180 })
    .withMessage("Address must be between 3 and 180 characters"),
  body("location.city").trim().isLength({ min: 2, max: 80 }).withMessage("City is required"),
  body("location.state").trim().isLength({ min: 2, max: 80 }).withMessage("State is required"),
  body("location.pincode").optional({ values: "falsy" }).trim().isLength({ max: 20 }).withMessage("Pincode is too long")
];

export const updateComplaintValidator = [
  ...complaintIdValidator,
  body("title").optional().trim().isLength({ min: 5, max: 140 }).withMessage("Invalid title length"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 3000 })
    .withMessage("Invalid description length"),
  body("category").optional().isIn(COMPLAINT_CATEGORIES).withMessage("Invalid complaint category"),
  body("location.address").optional().trim().isLength({ min: 3, max: 180 }).withMessage("Invalid address"),
  body("location.city").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Invalid city"),
  body("location.state").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Invalid state"),
  body("location.pincode").optional({ values: "falsy" }).trim().isLength({ max: 20 }).withMessage("Pincode is too long")
];

export const statusUpdateValidator = [
  ...complaintIdValidator,
  body("status").isIn(COMPLAINT_STATUSES).withMessage("Invalid status"),
  body("note").optional({ values: "falsy" }).trim().isLength({ max: 800 }).withMessage("Status note is too long")
];
