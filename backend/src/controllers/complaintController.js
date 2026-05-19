import Complaint from "../models/Complaint.js";
import { analyzeComplaintInput } from "../services/aiService.js";
import asyncHandler from "../utils/asyncHandler.js";

const staffRoles = ["admin", "department_agent"];

const canManageComplaint = (user, complaint) => {
  if (user.role === "admin") return true;
  if (user.role === "department_agent") {
    return !user.department || user.department === complaint.department;
  }
  return String(complaint.user?._id || complaint.user) === String(user._id);
};

const baseQueryForUser = (user) => {
  if (!staffRoles.includes(user.role)) {
    return { user: user._id };
  }

  if (user.role === "department_agent" && user.department) {
    return { department: user.department };
  }

  return {};
};

const applyListFilters = (query, filters) => {
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;

  if (filters.location) {
    const regex = new RegExp(filters.location, "i");
    query.$or = [
      { "location.address": regex },
      { "location.city": regex },
      { "location.state": regex },
      { "location.pincode": regex }
    ];
  }

  if (filters.q) {
    query.$text = { $search: filters.q };
  }

  return query;
};

const getAccessibleComplaint = async (id, user) => {
  const complaint = await Complaint.findById(id).populate("user", "name email role department");

  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canManageComplaint(user, complaint)) {
    const error = new Error("You do not have access to this complaint");
    error.statusCode = 403;
    throw error;
  }

  return complaint;
};

export const createComplaint = asyncHandler(async (req, res) => {
  const draft = {
    name: req.user.name,
    email: req.user.email,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    location: req.body.location,
    user: req.user._id
  };

  const aiAnalysis = await analyzeComplaintInput(draft);

  const complaint = await Complaint.create({
    ...draft,
    priority: aiAnalysis.urgency,
    department: aiAnalysis.department,
    aiAnalysis,
    statusHistory: [
      {
        status: "Pending",
        note: "Complaint registered successfully.",
        updatedBy: req.user._id
      }
    ]
  });

  res.status(201).json({
    success: true,
    message: "Complaint added successfully",
    complaint
  });
});

export const getComplaints = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;
  const query = applyListFilters(baseQueryForUser(req.user), req.query);
  const sort = req.query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 };

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .lean(),
    Complaint.countDocuments(query)
  ]);

  res.json({
    success: true,
    complaints,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  });
});

export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await getAccessibleComplaint(req.params.id, req.user);
  res.json({ success: true, complaint });
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await getAccessibleComplaint(req.params.id, req.user);

  if (["resolved", "closed", "rejected"].includes(complaint.status) && req.user.role === "citizen") {
    const error = new Error("Closed complaints cannot be edited by citizens");
    error.statusCode = 409;
    throw error;
  }

  const fields = ["title", "description", "category"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) complaint[field] = req.body[field];
  });

  if (req.body.location) {
    complaint.location = {
      ...(complaint.location?.toObject?.() || complaint.location || {}),
      ...req.body.location
    };
  }

  await complaint.save();
  res.json({
    success: true,
    message: "Complaint updated successfully",
    complaint
  });
});

export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaint = await getAccessibleComplaint(req.params.id, req.user);

  complaint.status = req.body.status;
  complaint.statusHistory.push({
    status: req.body.status,
    note: req.body.note || "",
    updatedBy: req.user._id
  });

  await complaint.save();
  res.json({
    success: true,
    message: "Complaint status updated successfully",
    complaint
  });
});

export const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await getAccessibleComplaint(req.params.id, req.user);

  if (req.user.role !== "admin" && String(complaint.user?._id || complaint.user) !== String(req.user._id)) {
    const error = new Error("Only the owner or an administrator can delete this complaint");
    error.statusCode = 403;
    throw error;
  }

  await complaint.deleteOne();
  res.json({ success: true, message: "Complaint deleted successfully" });
});

export const analyzeComplaint = asyncHandler(async (req, res) => {
  const complaint = await getAccessibleComplaint(req.params.id, req.user);
  const aiAnalysis = await analyzeComplaintInput(complaint);

  complaint.aiAnalysis = aiAnalysis;
  complaint.priority = aiAnalysis.urgency;
  complaint.department = aiAnalysis.department;
  await complaint.save();

  res.json({ success: true, complaint, aiAnalysis });
});

export const getComplaintStats = asyncHandler(async (req, res) => {
  const baseQuery = baseQueryForUser(req.user);

  const [total, pending, open, resolved, highPriority, critical, byStatus, byCategory] = await Promise.all([
    Complaint.countDocuments(baseQuery),
    Complaint.countDocuments({ ...baseQuery, status: "Pending" }),
    Complaint.countDocuments({ ...baseQuery, status: { $in: ["Pending", "submitted", "under_review", "assigned", "in_progress"] } }),
    Complaint.countDocuments({ ...baseQuery, status: { $in: ["resolved", "closed"] } }),
    Complaint.countDocuments({ ...baseQuery, priority: { $in: ["high", "critical"] } }),
    Complaint.countDocuments({ ...baseQuery, priority: "critical" }),
    Complaint.aggregate([{ $match: baseQuery }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Complaint.aggregate([{ $match: baseQuery }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
  ]);

  res.json({
    success: true,
    total,
    pending,
    open,
    resolved,
    highPriority,
    critical,
    byStatus,
    byCategory
  });
});

export const searchComplaintsByLocation = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;
  const location = req.query.location;
  const regex = new RegExp(location, "i");
  const query = applyListFilters(
    {
      ...baseQueryForUser(req.user),
      $or: [
        { "location.address": regex },
        { "location.city": regex },
        { "location.state": regex },
        { "location.pincode": regex }
      ]
    },
    {
      category: req.query.category,
      status: req.query.status,
      q: req.query.q
    }
  );
  const sort = req.query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 };

  const [complaints, total] = await Promise.all([
    Complaint.find(query).sort(sort).skip(skip).limit(limit).populate("user", "name email").lean(),
    Complaint.countDocuments(query)
  ]);

  res.json({
    success: true,
    location,
    complaints,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  });
});
