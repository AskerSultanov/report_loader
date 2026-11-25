import dbUtils from "../../../database/utils/index.js";
import reportPeriods from "../../../dateUtils/reportPeriods.js";
import filteringOfRequiredReportPeriods from "../utils/filteringOfRequiredReportPeriods.js";
import { getLastMondayFromCurrentMonth } from "../../../dateUtils/getLastMondayFromCurrentMonth.js";

var { getBasicReportsData } = dbUtils.reportModelUtils;
var { getUserReportLoadingState, resetAbandonedReports } =
  dbUtils.reportLoadingStateModelUtils;

var periodsFilter = async (req, res, next) => {
  var { userId, dateFrom, dateTo, needToLoadAllReports } = req.body;

  var dateFromIndex;
  var dateToIndex;

  if (needToLoadAllReports) {
    dateFromIndex = 0;

    var { lastMonday } = getLastMondayFromCurrentMonth();
    dateToIndex = reportPeriods.findIndex(
      (date) => date.dateFrom === lastMonday,
    );
  } else {
    dateFromIndex = reportPeriods.findIndex(
      (date) => date.dateFrom === dateFrom,
    );

    if (dateFromIndex < 0) {
      dateFromIndex = 0;
    }

    dateToIndex = reportPeriods.findIndex((date) => date.dateTo === dateTo);

    if (dateToIndex < 0) {
      var { lastMonday } = getLastMondayFromCurrentMonth();

      dateToIndex = reportPeriods.findIndex(
        (date) => date.dateFrom === lastMonday,
      );
      if (lastMonday > dateTo) {
        dateToIndex -= 1;
      }
    }
  }

  var requiredReportPeriods = reportPeriods.slice(
    dateFromIndex,
    dateToIndex + 1,
  );

  var { basicReportData } = await getBasicReportsData(userId);
  var userLoadingsState = await getUserReportLoadingState(userId);

  var { filteredRequiredReportPeriods, abandonedReportsAddedToQueue } =
    filteringOfRequiredReportPeriods(
      userLoadingsState,
      requiredReportPeriods,
      basicReportData,
    );

  if (!filteredRequiredReportPeriods.length) {
    return;
  }

  if (abandonedReportsAddedToQueue) {
    await resetAbandonedReports(userId);
  }

  req.body.filteredRequiredReportPeriods = filteredRequiredReportPeriods;

  next();
};

export default periodsFilter;
