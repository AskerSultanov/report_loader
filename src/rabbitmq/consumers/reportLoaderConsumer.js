import { channel } from "../initQueues.js";
import { dbClient } from "../../database/index.js";
import dbUtils from "../../database/utils/index.js";
import loader from "../../routes/index/utils/loader.js";
import getRequiredReportPeriods from "../../routes/index/utils/getRequiredReportPeriods.js";
import filteringOfRequiredReportPeriods from "../../routes/index/utils/filteringOfRequiredReportPeriods.js";

var isServerStartupLoad = false;
var queueName = "report.loading";

export var reportLoaderConsumer = () =>
  channel.consume(
    queueName,
    async (msg) => {
      channel.ack(msg);
      var data = JSON.parse(msg.content);
      var { userId, dateFrom, dateTo, needToLoadAllReports } = data;

      console.log({ data });

      var { requiredReportPeriods } = getRequiredReportPeriods(dateFrom, dateTo, needToLoadAllReports);

      var session = await dbClient.startSession();

      await session.withTransaction(async () => {
        var userReportLoadingState = await dbUtils.getReportLoadingState(userId, session);
        var savedReportPeriods = (await dbUtils.getReportPeriods(userId, session)).reportPeriods;

        var { filteredRequiredReportPeriods, abandonedReportsAddedToQueue } = filteringOfRequiredReportPeriods(
          userReportLoadingState,
          requiredReportPeriods,
          savedReportPeriods,
        );

        if (!filteredRequiredReportPeriods.length) {
          return;
        }

        if (abandonedReportsAddedToQueue) {
          await dbUtils.resetAbandonedReports(userId, session);
        }

        await dbUtils.pushToReportsQueue(userId, filteredRequiredReportPeriods, session);

        var { loadingInProgress, isReportLoadingIsStopped } = userReportLoadingState;

        if (loadingInProgress || isReportLoadingIsStopped) {
          return;
        }
      });

      loader(userId, isServerStartupLoad);
    },
    { noAck: false },
  );
