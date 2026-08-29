import { reportLoadingStateModel } from "../models/index.js";

var getReportLoadingState = async (userId, session) => {
  var sessionOptions = session ? { session: session } : {};
  var doc = await reportLoadingStateModel.findOne({ userId }, null, { ...sessionOptions });
  return doc;
};

export default getReportLoadingState;
