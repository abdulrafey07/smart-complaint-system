import mongoose from "mongoose";

export const COMPLAINT_CATEGORIES = [
  "Sanitation",
  "Roads",
  "Water Supply",
  "Electricity",
  "Public Safety",
  "Health",
  "Environment",
  "Administration",
  "Other"
];

export const COMPLAINT_STATUSES = [
  "Pending",
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
  "closed"
];

const aiAnalysisSchema = new mongoose.Schema(
  {
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    urgencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    department: {
      type: String,
      trim: true,
      default: "General Administration"
    },
    autoResponse: {
      type: String,
      trim: true,
      default: ""
    },
    summary: {
      type: String,
      trim: true,
      default: ""
    },
    model: {
      type: String,
      trim: true,
      default: ""
    },
    source: {
      type: String,
      enum: ["ai", "local-fallback"],
      default: "local-fallback"
    },
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      required: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ""
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Complainant name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"]
    },
    email: {
      type: String,
      required: [true, "Complainant email is required"],
      trim: true,
      lowercase: true,
      maxlength: [120, "Email cannot exceed 120 characters"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true
    },
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [140, "Title cannot exceed 140 characters"]
    },
    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"]
    },
    category: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      required: [true, "Complaint category is required"]
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        maxlength: [180, "Address cannot exceed 180 characters"]
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxlength: [80, "City cannot exceed 80 characters"]
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxlength: [80, "State cannot exceed 80 characters"]
      },
      pincode: {
        type: String,
        trim: true,
        maxlength: [20, "Pincode cannot exceed 20 characters"],
        default: ""
      }
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: "Pending",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true
    },
    department: {
      type: String,
      trim: true,
      default: "General Administration",
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    aiAnalysis: {
      type: aiAnalysisSchema,
      default: undefined
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    }
  },
  { timestamps: true }
);

complaintSchema.index({
  title: "text",
  description: "text",
  "location.address": "text",
  "location.city": "text",
  "location.state": "text"
});
complaintSchema.index({ category: 1, status: 1, createdAt: -1 });

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
