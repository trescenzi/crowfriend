const discord = require('discord.js');
const process = require('process');
const scheduleGame = require('./src/scheduleGame');
const {getCardText, cardSearch, getCardImage} = require('./src/paragon.js');
const bot = new discord.Client();

bot.match = function(regex, cb, channel) {
  this.on('message', (msg) => {
    let match;
    if (msg.channel.id !== channel && msg.channel.id !== '225034037180235777') return;
    if (match = msg.content.match(regex)) cb(msg, match);
  });
};

bot.match(/[pP]ing/, (msg) => msg.channel.sendMessage('Cawww!\n *flaps wings*'));
bot.match(/[fF]osh/, (msg) => msg.channel.sendMessage('Cosh!'));
bot.match(/fucking hell/, (msg) => msg.channel.sendMessage('(╯°□°）╯︵ ┻━┻'));
bot.match(/fl[oi]p\w*\s*fl[io]p\w*/, (msg) => {
  if (Math.floor(Math.random() * 2)) {
    msg.channel.sendMessage('flop');
  } else {
    msg.channel.sendMessage('flip');
  }
});

bot.match(/@\s*(\d+):0?(\d+)/, scheduleGame);

bot.match(/.*[cC]ard(.*)/, 
          (msg, match) => getCardImage(msg, match), '222739491062808576');

bot.match(/.*card search(.*)/,
          (msg, match) => cardSearch(msg, match), '222739491062808576');

bot.match(/.*card text(.*)/,
          (msg, match) => getCardText(msg, match), '222739491062808576');

bot.on('message', msg => {
  console.log(msg.timestamp + ':\t' + msg.author.username + ':' + msg.content);
});

bot.on('error', (e) => {
  console.log(e);
});

bot.on('ready', () => {
  console.log('I am ready!');
});

bot.login(process.env.CROWFRIENDTOKEN);
