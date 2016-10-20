const request = require('request-promise-native');
const process = require('process');
const fuzzy = require('fuzzy');

const apiHeader = {
  'X-Epic-ApiKey': process.env.PARAGONAPIKEY,
};
let cards = {};
let cardNames = [];

function sortFuzzyMatches(a, b) {
  return a.score > b.score ? -1 : 1;
}
function properCaseAll(names, name) {
  if (name) {
    const properName = name[0].toUpperCase() + name.substring(1);
    return names.concat(properName);
  }
  return names.concat('');
}

class Card {
  constructor(card) {
    this._card = card;
  }

  _parseCardStat(statName, damageType) {
    if (!statName) return;

    switch (statName.replace(/[\.$|,$]/, '')) {
      case 'MaxEnergy':
        return 'Max Mana';
      case 'AttackRating':
        return damageType === 'Energy' ? 'Energy Damage' : 'Physical Damage';
      case 'CriticalDamageChance':
        return 'Crit Chance';
      case 'CooldownReductionPercentage':
        return 'Cooldown';
      case 'MaxHealth':
        return 'Max Health';
      case '{attr:enar}':
      case 'EnergyResistanceRating':
        return 'Energy Armor';
      case '{attr:physar}':
      case 'PhysicalResistanceRating':
        return 'Physical Armor';
      case 'EnergyPenetrationRating':
        return 'Energy Pen';
      case 'PhysicalPenetrationRating':
        return 'Physical Pen';
      case 'HealthRegenRate':
        return 'Health Regen';
      case 'ManaRegenRate':
        return 'Mana Regen';
      case 'WellRigPlacementTimer':
        return 'Harvester Placement Time';
      case '{attr:mp}':
        return 'Mana';
      case '{attr:hp}':
        return 'Health';
      case '{attr:shld}':
        return 'Shield';
      case '{attr:cdr}':
        return 'Cooldown';
      default:
        return statName;
    }
  }

  _parseCardDescription(description) {
    return description.split(' ').reduce((description, word) => {
      console.log('thing', word);
      let parsedWord = this._parseCardStat(word);
      return `${description} ${parsedWord}`;
    }, '');
  }

  _parseEffectsArray(effects, damageType) {
    return effects.reduce((effects, effect) => {
          const descriptor = this._parseCardStat(effect.stat, damageType) ||
            this._parseCardDescription(effect.description);
          const value = typeof effect.value === 'number' ? 
              effect.value.toPrecision(3) : effect.cooldown;
          console.log('v', effect.description);
          return `${effects} ${descriptor} ${value || ''}\n`;
        }, '');
  }

  getText() {
    return request({
      url: `https://developer-paragon.epicgames.com/v1/card/${this._card.id}`,
      headers: apiHeader,
    }).then((body) => {
      const cardDescriptor = JSON.parse(body);
      const effects = this._parseEffectsArray(cardDescriptor.effects, cardDescriptor.damageType);
      const maxedEffects = this._parseEffectsArray(cardDescriptor.maxedEffects);
      const cost = cardDescriptor.cost;
      const name = cardDescriptor.name;
      const type = cardDescriptor.slotType;

      if (maxedEffects) {
        return `*${name}* ${cost}-${type}\n${effects}\nFully Upgraded: ${maxedEffects}`;
      }
      return `*${name}* ${cost}-${type}\n${effects}`;
    }).catch((e) => console.log(e));
  }

  get imageUrl() {
    return `https:${this._card.images.medium_stats}`;
  }
}
function parseCards(cards) {
  return cards.reduce((cards, card) => {
    cards[card.name] = new Card(card);
    cardNames.push(card.name);
    return cards;
  }, {});
}

request({
  url: 'https://developer-paragon.epicgames.com/v1/cards',
  headers: apiHeader,
}).then((body) => {
  cards = parseCards(JSON.parse(body)); 
}).catch((err) =>  console.log(err));

function getClosestCardToMatch(match) {
  const possibleNames = match[1].trim().split(' ')
                              .reduce(properCaseAll, [])
                              .reduce((ws, w, i, arr) => ws.concat(arr.slice(0,i+1).join(' ')), []);
  possibleNames.forEach((name) => {
    if (name in cards) {
      return cards[name];
    }
  });

  const closestMatch = possibleNames.reduce((matches, name) => {
    return matches.concat(fuzzy.filter(name, cardNames).sort(sortFuzzyMatches));
  }, []).sort(sortFuzzyMatches)[0];

  if (closestMatch && closestMatch.score > 220) {
    return cards[closestMatch.string];
  }

  return null;
}

function cardSearch(msg, match) {
  const search = match[1].trim();
  const names = fuzzy.simpleFilter(search, cardNames);
  names.forEach((name) => msg.channel.sendMessage(name));
}

function getCardImage(msg, match) {
  const card = getClosestCardToMatch(match);
  if (card) {
    msg.channel.sendMessage(card.imageUrl);
  }
}

function getCardText(msg, match) {
  const card = getClosestCardToMatch(match);
  if (card) {
    card.getText()
      .then((text) => msg.channel.sendMessage(text))
      .catch((e) => console.log(e));
  }
}

module.exports = {
  cardSearch,
  getCardImage,
  getCardText,
};
