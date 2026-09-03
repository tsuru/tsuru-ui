import moment from "moment";
function humanDuration(seconds: number) {
  return moment.utc(seconds * 1000).format("mm:ss");
}

function humanDateWithWeek(timestamp: string): string {
  return moment(timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a");
}

function humanDate(timestamp: string): string {
  return moment(timestamp).format("MMMM Do YYYY, h:mm:ss a");
}

function humanSince(d: number) {
  // Allow deviation no more than 2 seconds(excluded) to tolerate machine time
  // inconsistence, it can be considered as almost now.
  if (d < -1) {
    return "<invalid>";
  } else if (d < 0) {
    return "0s";
  } else if (d < 60 * 2) {
    return d + "s";
  }
  var minutes = Math.floor(d / (60 * 1000));
  if (minutes < 10) {
    var s = Math.floor(d / 1000) % 60;
    if (s === 0) {
      return minutes + "m";
    }
    return minutes + "m" + s + "s";
  } else if (minutes < 60 * 3) {
    return minutes + "m";
  }
  var hours = Math.floor(d / (60 * 60 * 1000));
  if (hours < 8) {
    var m = Math.floor(d / (60 * 1000)) % 60;
    if (m === 0) {
      return hours + "h";
    }
    return hours + "h" + m + "m";
  } else if (hours < 48) {
    return hours + "h";
  } else if (hours < 24 * 8) {
    var h = hours % 24;
    if (h === 0) {
      return Math.floor(hours / 24) + "d";
    }
    return Math.floor(hours / 24) + "d" + h + "h";
  } else if (hours < 24 * 365 * 2) {
    return Math.floor(hours / 24) + "d";
  } else if (hours < 24 * 365 * 8) {
    var dy = Math.floor(hours / 24) % 365;
    if (dy === 0) {
      return Math.floor(hours / (24 * 365)) + "y";
    }
    return Math.floor(hours / (24 * 365)) + "y" + dy + "d";
  }
  return Math.floor(hours / (24 * 365)) + "y";
}

export { humanDate };
const time = { humanDuration, humanSince, humanDateWithWeek };
export default time;
