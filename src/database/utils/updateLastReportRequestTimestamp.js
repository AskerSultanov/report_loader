import { reportLoadingStateModel } from "../models/index.js";

var mskTimeOffsetInMs = 10_800_000;

var updateLastReportRequestTimestamp = async (userId, session) => {
  var lastReportRequestTimestamp = Date.now() + mskTimeOffsetInMs;

  var { lastReportRequestTimestamp } = await reportLoadingStateModel.updateOne(
    { userId },
    { $set: { lastReportRequestTimestamp } },
    { session: session },
  );
  return { lastReportRequestTimestamp };
};

export default updateLastReportRequestTimestamp;
