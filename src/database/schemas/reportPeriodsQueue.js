import { Schema } from "mongoose";

var reportPeriodsQueueItemSchema = new Schema(
  {
    userId: { type: String, required: true },
    dateTo: { type: String, required: true },
    dateFrom: { type: String, required: true },
    failedCount: { type: Number, required: true, default: 0, min: 0, max: 3 },
  },
  { autoIndex: false },
);

reportPeriodsQueueItemSchema.index(
  { userId: 1, dateFrom: 1 },
  { unique: true },
);

export default reportPeriodsQueueItemSchema;
