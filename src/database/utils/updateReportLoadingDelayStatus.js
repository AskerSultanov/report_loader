import { reportLoadingStateModel } from "../models/index.js";

var updateReportLoadingDelayStatus = async (userId, isReportLoadingDelayed) =>
  await reportLoadingStateModel.updateOne({ userId }, { $set: { isReportLoadingDelayed } });

export default updateReportLoadingDelayStatus;
