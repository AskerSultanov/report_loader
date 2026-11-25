import { Schema } from "mongoose";

var emptyReportPeriodsItemSchema = new Schema(
  {
    userId: { type: String, required: true },
    dateTo: { type: String, required: true },
    dateFrom: { type: String, required: true },
  },
  { autoIndex: false },
);

export default emptyReportPeriodsItemSchema;
