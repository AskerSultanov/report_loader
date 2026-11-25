import loader from "../utils/loader.js";
import dbUtils from "../../../database/utils/index.js";

var { addAbandonedReportsToQueue } = dbUtils.reportLoadingStateModelUtils;

var resumeAbandonedReportsLoading = async (req, res) => {
  res.sendStatus(202);

  var { userId } = req.body;

  await addAbandonedReportsToQueue(userId).then(() =>
    setTimeout(() => loader(userId), 3000),
  );
};

export default resumeAbandonedReportsLoading;
