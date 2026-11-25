import wbapi from "./WBAPI/index.js";
import dbUtils from "../../../database/utils/index.js";
import processReportSkus from "./reportParsing/index.js";
import getNewSkusToListGoods from "./getNewSkusToListGoods.js";
import getReportTargetYearAndMonth from "./getReportTargetYearAndMonth.js";

var selectedFields = ["listGoods.id", "listGoods.skuName"];

var monthList = [
  "январь",
  "февраль",
  "марта",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

var { createReport } = dbUtils.reportModelUtils;
var { updateWBTokenLastUsedTimestamp } = dbUtils.wbTokenModelUtils;
var { getListGoodsFromDb, saveNewSkusToDb } = dbUtils.goodsModelUtils;
var { addNewUserTaxSetting, updateTaxSettings } = dbUtils.taxSettingModelUtils;
var { updateLastReportRequestTimestamp } = dbUtils.reportLoadingStateModelUtils;

var reportsProcessing = async (userId, dateFrom, dateTo, token, session) => {
  var lastLoadedReport = {};
  var startYear = +dateFrom.split("-")[0];
  var endYear = +dateTo.split("-")[0];
  var isCrossYearPeriod = startYear !== endYear;

  var { reports, reportPeriodIsEmpty } = await wbapi.getReports(
    userId,
    dateFrom,
    dateTo,
    token,
  );

  if (reportPeriodIsEmpty) {
    return { lastLoadedReport, reportPeriodIsEmpty };
  }

  await updateWBTokenLastUsedTimestamp(userId, session);
  await updateLastReportRequestTimestamp(userId, session);

  var reportSkus = [];
  var updatedTaxSettings = [];
  var { reportId } = reports.weeklyFinancialReport[0];
  var { targetYear, targetMonthIndex } = getReportTargetYearAndMonth(
    dateFrom,
    dateTo,
  );

  for (var year = startYear; year <= endYear; year++) {
    var { taxSetting } = await addNewUserTaxSetting(userId, year, session);
    var { skus, recalculatedTaxSettings } = await processReportSkus(
      reports,
      taxSetting,
      isCrossYearPeriod,
    );

    reportSkus.push(...skus);

    updatedTaxSettings.push({ year, data: recalculatedTaxSettings });
  }

  if (!reportSkus.length) {
    return { lastLoadedReport, reportPeriodIsEmpty: true };
  }

  var basicReportData = {};

  basicReportData.userId = userId;
  basicReportData.reportId = reportId;
  basicReportData.dateFrom = dateFrom;
  basicReportData.dateTo = dateTo;
  basicReportData.year = targetYear;
  basicReportData.monthIndex = targetMonthIndex;
  basicReportData.isCrossYearPeriod = isCrossYearPeriod;

  await createReport(basicReportData, reportSkus, session);

  if (reportSkus.length) {
    await updateTaxSettings(userId, updatedTaxSettings, session);

    var skuNames = reportSkus.map((sku) => sku.skuName);

    var { listGoods } = await getListGoodsFromDb(
      userId,
      skuNames,
      selectedFields,
      session,
    );

    var skuNamesAndIds = reportSkus.map((sku) => {
      return { name: sku.skuName, id: sku.id };
    });

    var { newSkus } = getNewSkusToListGoods(listGoods, skuNamesAndIds);

    if (newSkus.length) {
      await saveNewSkusToDb(userId, newSkus, session);
    }
  }

  lastLoadedReport = {
    reportId,
    dateFrom,
    dateTo,
    month: monthList[targetMonthIndex],
    year: targetYear,
  };

  return { lastLoadedReport, reportPeriodIsEmpty: !reportSkus.length };
};

export default reportsProcessing;
