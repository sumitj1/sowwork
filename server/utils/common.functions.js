const moment = require("moment");

const formatNumber = (num) => {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  } else {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
};

const getTimeDifferenceText = (timestamp) => {
  const currentTime = Date.now(); // Get the current timestamp in milliseconds
  const differenceInMilliseconds = currentTime - timestamp;

  const minutesAgo = Math.floor(differenceInMilliseconds / (1000 * 60));
  const hoursAgo = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
  const daysAgo = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  if (minutesAgo < 60) {
    return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;
  } else if (hoursAgo < 24) {
    return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;
  } else if (minutesAgo < 10080) {
    //7 days into minutes
    return `${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`;
  } else {
    return moment(timestamp).format("ll");
  }
};

module.exports = {
  formatNumber,
  getTimeDifferenceText,
};
