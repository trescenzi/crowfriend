const discord = require('discord.js');
const process = require('process');
const scheduleGame = require('./src/scheduleGame');
const fs = require('fs');
const cards = JSON.parse(fs.readFileSync('cards-obj.json'));
const cardNames = Object.keys(cards);
const fuzzy = require('fuzzy');
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

function properCaseAll(names, name) {
  if (name) {
    const properName = name[0].toUpperCase() + name.substring(1);
    return names.concat(properName);
  }
  return names.concat('');
}

function sortFuzzyMatches(a, b) {
  return a.score > b.score ? -1 : 1;
}

bot.match(/.*[cC]ard(.*)/, (msg, match) => {
  const possibleNames = match[1].trim().split(' ')
                              .reduce(properCaseAll, [])
                              .reduce((ws, w, i, arr) => ws.concat(arr.slice(0,i+1).join(' ')), []);
  let matched = false;
  possibleNames.forEach((name) => {
    if (name in cards) {
      matched = true;
      msg.channel.sendMessage('https:' + cards[name].images.medium_stats);
    }
  });

  if (!matched) {
    const closestMatch = possibleNames.reduce((matches, name) => {
      return matches.concat(fuzzy.filter(name, cardNames).sort(sortFuzzyMatches));
    }, []).sort(sortFuzzyMatches)[0];

    if (closestMatch && closestMatch.score > 220) {
      msg.channel.sendMessage('https:' + cards[closestMatch.string].images.medium_stats);
    }
  }
}, '222739491062808576');

bot.match(/.*card search(.*)/, (msg, match) => {
  //console.log(Object.keys(cards).length);
  const search = match[1].trim();
  const names = fuzzy.simpleFilter(search, cardNames);
  names.forEach((name) => msg.channel.sendMessage(name));
}, '222739491062808576');

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
