import loader from "../utils/loader.js";
import dbUtils from "../../../database/utils/index.js";

var loadingStopReason = "";
var statusOfReportLoadingStop = false;

var { getUserReportLoadingState, updateReportLoadingStoppedStatus } =
  dbUtils.reportLoadingStateModelUtils;

var resumeReportLoading = async (req, res) => {
  var { userId } = req.body;

  var user = await getUserReportLoadingState(userId);

  res.sendStatus(202);

  if (!user.isReportLoadingIsStopped) {
    return;
  }

  await updateReportLoadingStoppedStatus(
    userId,
    statusOfReportLoadingStop,
    loadingStopReason,
  );

  await loader(userId);
};

export default resumeReportLoading;
