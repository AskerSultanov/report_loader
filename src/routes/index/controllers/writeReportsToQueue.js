import dbUtils from "../../../database/utils/index.js";

var { pushToReportsQueue, getUserReportLoadingState } =
  dbUtils.reportLoadingStateModelUtils;

var writeReportsToQueue = async (req, res, next) => {
  var { userId, filteredRequiredReportPeriods } = req.body;

  await pushToReportsQueue(userId, filteredRequiredReportPeriods);

  var { loadingInProgress, isReportLoadingIsStopped } =
    await getUserReportLoadingState(userId);

  if (isReportLoadingIsStopped || loadingInProgress) {
    return;
  }

  next();
};

export default writeReportsToQueue;
