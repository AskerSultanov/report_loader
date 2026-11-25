import { Schema } from "mongoose";

var lastLoadedReportSchema = new Schema(
  {
    userId: { type: String, required: true },
    year: { type: Number, required: true },
    dateTo: { type: String, required: true },
    dateFrom: { type: String, required: true },
    reportId: { type: Number, required: true },
    monthIndex: { type: Number, required: true, min: 0, max: 11 },
  },
  { autoIndex: false },
);

lastLoadedReportSchema.index({ userId: 1 }, { unique: true });

export default lastLoadedReportSchema;
