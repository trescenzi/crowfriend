const schedule = require('node-schedule');

module.exports = function(msg, match) {
  const timeToPlay = {
    hour: parseInt(match[1]),
    minute: parseInt(match[2]),
  };
  console.log(timeToPlay);
  const j = schedule.scheduleJob(timeToPlay, function() {
    msg.channel.sendMessage('@Tombo time to play');
    j.cancel();
  });
};
