/**
 * @typedef {Object} Reward
 * @property {string} type
 * @property {string} item
 * @property {number} chance
 */

/**
 * @typedef {Object} Location
 * @property {string} location
 * @property {string} rarity
 * @property {number} chance
 * @property {string} [rotation]
 */

/**
 * @typedef {Object} WarframeMarketId
 * @property {string} id
 * @property {string} urlName
 */

/**
 * @typedef {Object} Relic
 * @property {string} name
 * @property {Reward[]} rewards
 * @property {Location[]} locations
 * @property {WarframeMarketId} warframeMarket
 * @property {boolean} vaulted
 */

/**
 * @type {Relic[]}
 */
const rawData = require("./data/Relics.min.json");
module.exports = rawData;