import got from "got";
import cheerio from "cheerio";
import config from "../config.json";
import {DropRelic, MarketItemRoot, Relic, WarframeMarketId} from "./Types";
import crypto from "crypto";
import fs from "fs";
import path from "path";

async function Generate(){
    console.log("Checking for new data");
    const relicRaw = await got(config.RelicUrl);

    const newer = await checkIfNewer(relicRaw.body);
    if(!newer && !process.env.FORCE){
        console.log("Finished checking for updates");
        process.exit(0);
    }

    console.log("Starting Relic data generation.");
    const relics = await GetRelics(relicRaw.body);
    const relicWithLoc = await GetDropLocations(relics);
    const relicWithWfM = await getWfMarketIds(relicWithLoc);

    // Paths
    const dataDirPath = path.join(process.cwd(), "data/");
    const relicsJson = path.join(dataDirPath, "Relics.json");
    const errorsJson = path.join(dataDirPath, "Errors.json");
    const minRelicsJson = path.join(dataDirPath, "Relics.min.json");
    const minErrorsJson = path.join(dataDirPath, "Errors.min.json");

    console.log("Writing files");
    fs.writeFileSync(relicsJson, JSON.stringify(relicWithWfM, null, 4), {encoding: "utf-8"});
    fs.writeFileSync(errorsJson, JSON.stringify(missingWfMIds, null, 4), {encoding: "utf-8"});
    fs.writeFileSync(minRelicsJson, JSON.stringify(relicWithWfM), {encoding: "utf-8"});
    fs.writeFileSync(minErrorsJson, JSON.stringify(missingWfMIds), {encoding: "utf-8"});

    await getWarframeVersion();
    console.log("Finished!");
}
async function getWarframeVersion(){
    console.log("Writing Warframe Version");
    const data = await got(config.MainPage, {headers: { "User-Agent": config.wfUserAgent }});
    const $ = cheerio.load(data.body);
    let elem: CheerioElement;
    const wfVersion = $("td[style=\"vertical-align:middle; height: 70px;\"]").text().replace("\n", "").trim();
    fs.writeFile(path.join(process.cwd(), "data/", "version"),wfVersion, {encoding: "utf-8"}, (err => {
        if(err){
            return Promise.reject(err);
        }
        return Promise.resolve();
    }));
}

async function checkIfNewer(raw: string){
    const hash = crypto.createHash("md5").update(raw).digest("hex");
    try {
        const last = fs.readFileSync(path.join(process.cwd(), "last_hash"), {encoding: "utf-8"});
        if(last !== hash){
            console.log(`New Data found. Old: ${last} New: ${hash}`);
            fs.writeFileSync(path.join(process.cwd(), "last_hash"), hash, {encoding: "utf-8"});
            return true;
        }
        console.log("No new Data found");
        return false;
    }
    catch (e) {
        console.log("No hash found. Regenerating ..");
        return true;
    }
}

const missingWfMIds: any[] = [];

async function getWfMarketIds(relics: Relic[]): Promise<Relic[]>{
    console.log("Importing Warframe Market Id's");
    const data = await got(config.WarframeMarket, {json: true});
    const items = data.body as MarketItemRoot;
    for(let relic of relics){
        const mItem = items.payload.items.find(x => x.item_name === relic.name + " Intact");
        if(typeof mItem !== "undefined"){
            relic.warframeMarket = {id: mItem.id, urlName: mItem.url_name} as WarframeMarketId;
        }
        else {
            relic.warframeMarket = null;
            missingWfMIds.push(relic);
        }
    }
    console.log(`Imported Warframe Market Id's. Errors: ${missingWfMIds.length}`);
    return relics;
}

async function GetDropLocations(relics: Relic[]): Promise<Relic[]>{
    console.log("Loading Drop Locations from WFCD");
    const data = await got(config.MissionUrl, {json: true});
    const missions = data.body as DropRelic[];

    for(let relic of relics){
        relic.locations = [];
        const mission = missions.find(x => x.name === relic.name + " Intact");
        if(typeof mission !== "undefined"){
            if(mission.drops){
                for(const drop of mission.drops){

                    relic.locations.push({
                        location: drop.location,
                        rarity: drop.rarity,
                        chance: drop.chance
                    });
                }
                relic.vaulted = false;
            }else {
                relic.vaulted = true;
            }
        }
        else {
            relic.vaulted = true;
        }
    }
    console.log(`Loaded Drop Locations from WFCD.`);
    return relics;
}

async function GetRelics(rawData: string): Promise<Relic[]>{
    console.log("Loading Relics from DE");
    const $: CheerioStatic = cheerio.load(rawData);
    let relics: Relic[] = [];
    const table = $('#relicRewards').next("table");
    const tbody = table.children()[0];
    let current: any = null;

    for(const tr of tbody.children){
        let elem = tr.children[0];
        if(elem.name === "th"){
            if(current){
                relics.push(current);
            }
            current = {};
            current.name = $(elem).text().replace(/\([A-Za-z]*\)/i, "")
                .replace("Relic", "").trim();
            current.rewards = [];
        }
        if(elem.name === "td" && elem.attribs.class !== "blank-row"){
            const chanceEl = tr.children[1];
            const chanceStr = $(chanceEl).text();
            const chanceRaw = chanceStr.split(" ")[1].replace(/\(?\)?%?/g, "");
            const chance = {type: chanceStr.split(" ")[0].trim(),
                chance: Number.parseInt(chanceRaw.trim()) / 100,
                item: $(elem).text()};
            current.rewards!.push(chance);
        }
    }
    relics.push(current);
    const old = relics.length;
    console.log("Deduping");
    relics = relics.filter((v, i, s) => {
        return relics.findIndex(x => x.name === v.name) === i;
    });
    console.log(`Deduping finished New: ${relics.length} Old: ${old}`);

    console.log(`Finished loading ${relics.length} relics from DE`);
    return relics;
}

export { Generate };