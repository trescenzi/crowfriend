const discord = require('discord.js');
const schedule = require('node-schedule');
const process = require('process');
const bot = new discord.Client();

bot.on('message', msg => {
  console.log(msg.timestamp + ':\t' + msg.author.username + ':' + msg.content);
  const content = msg.content;
  let match;

  if (msg.channel.id !== '225034037180235777') return;

  if (content.match(/[pP]ing/)) {
    msg.channel.sendMessage('Cawww!');
  }
  if (content.match(/[fF]osh/)) {
    msg.channel.sendMessage('Cosh!');
  }

  if (match = content.match(/@\s*(\d+):(\d+)/)) {
    console.log(match[0], match[1], match[2]);
    const j = schedule.scheduleJob({hour: match[1], minute: match[2]}, function() {
      console.log('hey');
      msg.channel.sendMessage('@Tombo time to play');
      j.cancel();
    });
  }
});

bot.on('error', (e) => {
  console.log(e);
});

bot.on('ready', () => {
  console.log('I am ready!');
});

bot.login(process.env.CROWFRIENDTOKEN);
