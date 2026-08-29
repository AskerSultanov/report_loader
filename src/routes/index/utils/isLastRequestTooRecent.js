var mskTimeOffsetInMs = 10_800_000;

var isLastRequestTooRecent = (lastReportRequestTimestamp, NEXT_REPORT_DELAY_MS) => {
  var delayInMs = 0;

  var currentTimestamp = Date.now() + mskTimeOffsetInMs;

  var difference = currentTimestamp - lastReportRequestTimestamp;

  var needToDalay = difference < NEXT_REPORT_DELAY_MS;

  if (needToDalay) {
    delayInMs = NEXT_REPORT_DELAY_MS - difference;
  }

  return { needToDalay, delayInMs };
};

export default isLastRequestTooRecent;
