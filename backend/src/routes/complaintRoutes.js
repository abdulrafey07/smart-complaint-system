import express from "express";
import {
  analyzeComplaint,
  createComplaint,
  deleteComplaint,
  getComplaintById,
  getComplaintStats,
  getComplaints,
  searchComplaintsByLocation,
  updateComplaint,
  updateComplaintStatus
} from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  complaintIdValidator,
  complaintQueryValidator,
  createComplaintValidator,
  locationSearchValidator,
  statusUpdateValidator,
  updateComplaintValidator
} from "../validators/complaintValidators.js";

const router = express.Router();

router.use(protect);

router.get("/stats/summary", getComplaintStats);
router.get("/search", locationSearchValidator, validateRequest, searchComplaintsByLocation);
router
  .route("/")
  .get(complaintQueryValidator, validateRequest, getComplaints)
  .post(createComplaintValidator, validateRequest, createComplaint);

router.post("/:id/analyze", complaintIdValidator, validateRequest, analyzeComplaint);
router.patch("/:id/status", statusUpdateValidator, validateRequest, updateComplaintStatus);

router
  .route("/:id")
  .get(complaintIdValidator, validateRequest, getComplaintById)
  .put(statusUpdateValidator, validateRequest, updateComplaintStatus)
  .patch(updateComplaintValidator, validateRequest, updateComplaint)
  .delete(complaintIdValidator, validateRequest, deleteComplaint);

export default router;
