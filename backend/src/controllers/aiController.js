import { analyzeComplaintWithProvider } from "../services/aiService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const analyzeComplaint = asyncHandler(async (req, res) => {
  const analysis = await analyzeComplaintWithProvider({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    location: req.body.location
  });

  res.json({
    success: true,
    analysis: {
      urgency: analysis.urgency,
      urgencyScore: analysis.urgencyScore,
      responsibleDepartment: analysis.department,
      summary: analysis.summary,
      responseMessage: analysis.autoResponse,
      model: analysis.model,
      source: analysis.source,
      analyzedAt: analysis.analyzedAt
    }
  });
});
