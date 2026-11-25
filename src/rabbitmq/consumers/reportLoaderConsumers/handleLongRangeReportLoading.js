import dbUtils from "../../../database/utils/index.js";
import getRequiredReportPeriods from "../../../routes/index/utils/getRequiredReportPeriods.js";
import filteringOfRequiredReportPeriods from "../../../routes/index/utils/filteringOfRequiredReportPeriods.js";

var { getBasicReportsData } = dbUtils.reportModelUtils;
var { getUserReportLoadingState, resetAbandonedReports, pushToReportsQueue } =
  dbUtils.reportLoadingStateModelUtils;

var handleLongRangeReportLoading = async (data, session) => {
  var { userId, dateFrom, dateTo, needToLoadAllReports } = data;
  var { requiredReportPeriods } = getRequiredReportPeriods(
    dateFrom,
    dateTo,
    needToLoadAllReports,
  );

  var { basicReportData } = await getBasicReportsData(userId, session);

  var userReportLoadingState = await getUserReportLoadingState(userId, session);

  var { filteredRequiredReportPeriods, abandonedReportsAddedToQueue } =
    filteringOfRequiredReportPeriods(
      userReportLoadingState,
      requiredReportPeriods,
      basicReportData,
    );

  if (!filteredRequiredReportPeriods.length) {
    return;
  }

  if (abandonedReportsAddedToQueue) {
    await resetAbandonedReports(userId, session);
  }

  await pushToReportsQueue(userId, filteredRequiredReportPeriods, session);

  var { loadingInProgress, isReportLoadingIsStopped } = userReportLoadingState;

  if (loadingInProgress || isReportLoadingIsStopped) {
    return;
  }
};

export default handleLongRangeReportLoading;
