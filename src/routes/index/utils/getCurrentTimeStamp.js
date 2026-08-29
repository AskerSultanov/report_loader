var mskTimeOffsetInMs = 10_800_000;

var getCurrentTimeStamp = () => {
  return { currentTimeMs: Date.now() + mskTimeOffsetInMs };
};

export default getCurrentTimeStamp;
