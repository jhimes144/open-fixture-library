const path = require('path');
const fs = require('fs');

const Manufacturer = require(path.join(__dirname, 'Manufacturer.js'));
const Meta = require(path.join(__dirname, 'Meta.js'));
const Physical = require(path.join(__dirname, 'Physical.js'));
const Channel = require(path.join(__dirname, 'Channel.js'));
const Mode = require(path.join(__dirname, 'Mode.js'));


/*
  benchmark results for accessing fix.physical (10,000,000 iterations):
  - without cache: ~1.9s
  - with cache: ~0.52s (nearly 4 times faster!)
  => that proves why caching, even for these small objects, is useful

  Code:
    const benchmarkIterations = 10000000;
    function benchmark() {
      const t0 = process.hrtime();

      for (let i = 0; i < benchmarkIterations; i++) {
        fix1.physical;
      }

      const deltaT = process.hrtime(t0);

      console.log(deltaT);
    }
*/


module.exports = class Fixture {
  constructor(jsonObject, man) {
    this.jsonObject = jsonObject; // calls the setter
    this.manufacturer = man; // also calls the setter
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
    this._cache = {};
  }

  set manufacturer(newMan) {
    if (newMan instanceof Manufacturer) {
      this._manufacturer = newMan;
    }
    else {
      this._manufacturer = new Manufacturer(newMan);
    }
  }

  get manufacturer() {
    return this._manufacturer;
  }

  get name() {
    return this._jsonObject.name; // required
  }

  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }

  get categories() {
    return this._jsonObject.categories; // required
  }

  get mainCategory() {
    return this.categories[0];
  }

  get meta() {
    if (!('meta' in this._cache)) {
      this._cache.meta = new Meta(this._jsonObject.meta);
    }

    return this._cache.meta;
  }

  get comment() {
    return this._jsonObject.comment || '';
  }

  get hasComment() {
    return 'comment' in this._jsonObject;
  }

  get manualURL() {
    return this._jsonObject.manualURL || null;
  }

  get physical() {
    if (!('physical' in this._cache)) {
      this._cache.physical = 'physical' in this._jsonObject ? new Physical(this._jsonObject.physical) : null;
    }

    return this._cache.physical;
  }

  // array of all channel keys and aliases, ordered by appearance
  get allChannelKeys() {
    if (!('allChannelKeys' in this._cache)) {
      let keys = [];

      for (const channel of this.availableChannels) {
        keys = keys.concat(channel.key, channel.fineChannelAliases, channel.switchingChannelAliases);
      }

      this._cache.allChannelKeys = keys;
    }

    return this._cache.allChannelKeys;
  }

  // array of all Channel, FineChannel and SwitchingChannel objects, ordered by appearance
  get allChannels() {
    if (!('allChannels' in this._cache)) {
      let channels = [];

      for (const channel of this.availableChannels) {
        channels = channels.concat(channel, channel.fineChannels, channel.switchingChannels);
      }

      this._cache.allChannels = channels;
    }

    return this._cache.allChannels;
  }

  // array, ordered by appearance
  get availableChannelKeys() {
    return Object.keys(this._jsonObject.availableChannels);
  }

  // array of Channel objects, ordered by appearance
  get availableChannels() {
    if (!('availableChannels' in this._cache)) {
      this._cache.availableChannels = this.availableChannelKeys.map(
        key => new Channel(this._jsonObject.availableChannels[key], key)
      );
    }

    return this._cache.availableChannels;
  }

  // array, ordered by appearance
  get fineChannelAliases() {
    return this._concatChannelArrayProperty('fineChannelAliases');
  }

  // array of FineChannel objects, ordered by appearance
  get fineChannels() {
    return this._concatChannelArrayProperty('fineChannels');
  }

  // array, ordered by appearance
  get switchingChannelAliases() {
    return this._concatChannelArrayProperty('switchingChannelAliases');
  }

  // array of SwitchingChannel objects, ordered by appearance
  get switchingChannels() {
    return this._concatChannelArrayProperty('switchingChannels');
  }

  _concatChannelArrayProperty(property) {
    if (!(property in this._cache)) {
      let values = [];

      for (const channel of this.availableChannels) {
        values = values.concat(channel[property]);
      }

      this._cache[property] = values;
    }

    return this._cache[property];
  }

  // returns Channel, FineChannel, SwitchingChannel or null
  getChannelByKey(key) {
    if (!('channelsByKey' in this._cache)) {
      this._cache.channelsByKey = {};

      for (const channel of this.allChannels) {
        this._cache.channelsByKey[channel.key] = channel;
      }
    }

    return this._cache.channelsByKey[key] || null;
  }

  get heads() {
    return this._jsonObject.heads || {};
  }

  get modes() {
    if (!('modes' in this._cache)) {
      this._cache.modes = [];
      for (const jsonMode of this._jsonObject.modes) {
        this._cache.modes.push(new Mode(jsonMode, this));
      }
    }

    return this._cache.modes;
  }


  static fromRepository(man, fix) {
    const fixPath = path.join(__dirname, '..', '..', 'fixtures', man, fix + '.json');
    return new this(JSON.parse(fs.readFileSync(fixPath, 'utf8')), man);
  }
};