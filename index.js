process.env=require("./env.json");
const fs=require("fs");
const fetch=require("node-fetch");
var commands=require("./commands.json");
var parseString = require('xml2js').parseString;
var config=require("./comms.json");
function save(){
    fs.writeFileSync("./comms.json",JSON.stringify(config));
}
function searchLog(term){
    if(term?.length===0) term=null;
    var slog=JSON.parse(fs.readFileSync("./latestSpoiler.json",'utf-8'));
    var locs=[];
    slog["spoiler-log"]["all-locations"][0].location.forEach(location=>{
        locs.push({
            location:location.$.name,
            item:location["_"]
        });
    });
    var possibleChoices=[];
    var longest=0;
    if(term!==undefined&&term!==null){
        var possibleChoices=[];
        var longest=0;
        locs.forEach(loc=>{
            if(loc.item.toLowerCase().includes(term)){
                possibleChoices.push(loc);
                if(loc.item.length>longest){
                    longest=loc.item.length;
                }
            }
        });
        return `Searching log from <@${slog.poster}> for \`${term.toLowerCase()}\`...${possibleChoices.length>4?`\nFirst 5 possible item locations:`:""}${possibleChoices.length===0?`\nNo locations found.`:""}\n${possibleChoices.slice(0,5).map(a=>`- \`${a.item.padEnd(longest)}\`: ||\`${a.location.padEnd(60)}\`||`).join("\n")}`;
    }
    else{
        for(var i=0;i<5;i++){
            var loc=locs[Math.floor(Math.random()*locs.length)];
            possibleChoices.push(loc);
            if(loc.item.length>longest){
                longest=loc.item.length;
            }
        }
        return `Searching log from <@${slog.poster}> for 5 random hints...\n${possibleChoices.slice(0,5).map(a=>`- \`${a.item.padEnd(longest)}\`: ||\`${a.location.padEnd(60)}\`||`).join("\n")}`;
    }
}
const {Client,GatewayIntentBits,Partials}=require("discord.js");
const { resourceLimits } = require("worker_threads");
const client=new Client({
    intents:Object.keys(GatewayIntentBits).map(a=>GatewayIntentBits[a]),
    partials:Object.keys(Partials).map(a=>Partials[a])
});
var lastStarted;
client.once("ready",()=>{
    console.log(`Logged MM3DRBot Functions into ${client.user.tag}`);
    lastStarted=Date.now();
});
client.on("messageCreate",async msg=>{
    if(msg.content.startsWith(config.prefix)&&config.comms.hasOwnProperty(msg.content.slice(1).toLowerCase())){
        msg.reply({content:config.comms[msg.content.slice(1).toLowerCase()],allowedMentions:{parse:[]}});
    }
    else if(msg.content.startsWith(`${config.prefix}hint`)){
        msg.reply({content:searchLog(msg.content.slice(6).toLowerCase()),allowedMentions:{parse:[]}});
    }

    if(msg.attachments.size>0){
        msg.attachments.forEach(a=>{
            if(a.name.toLowerCase().endsWith("spoilerlog.xml")){
                fetch(a.url).then(async d=>{
                        d=await d.text();
                        return d.replace(/\<junk\shunt\shere\>/ig,"Junk Hint Here");
                    }).then(d=>{
                    parseString(d, (e,result)=>{
                        if(result===undefined||result===null){
                            msg.reply(`An error has occured.\n\n${e}`);
                            return;
                        }
                        result.poster=msg.author.id;
                        fs.writeFileSync("./latestSpoiler.json",JSON.stringify(result));
                        msg.reply({
                            content:`Spoiler Log Parsed. To search this log, use ${commands.hint}. To search this log after another log is uploaded, upload this log to the ${commands.hint} \`file\` option.`,
                            allowedMentions:{parse:[]},
                            embeds: [{
                                "type": "rich",
                                "title": `Spoiler Log Parsed`,
                                "description": "",
                                "color": 0x840794,
                                "fields": [
                                    {
                                        "name": `Randomizer Version`,
                                        "value": result["spoiler-log"].$.version,
                                        "inline": false
                                    },
                                    {
                                        "name":`Logic Mode`,
                                        "value":result["spoiler-log"].settings[0].setting[0]["_"],
                                        "inline":true
                                    },
                                    {
                                        "name":`Small Keys`,
                                        "value":result["spoiler-log"].settings[0].setting[9]["_"],
                                        "inline":true
                                    },
                                    {
                                        "name":`Boss Keys`,
                                        "value":result["spoiler-log"].settings[0].setting[10]["_"],
                                        "inline":true
                                    }
                                ]
                            }]
                        });
                    });
                    save();
                });
            }
        });
    }
});
client.on("interactionCreate",async cmd=>{
    switch(cmd.commandName){
        case "add_trigger":
            if(config.comms.hasOwnProperty(cmd.options.getString("name").toLowerCase())){
                cmd.reply(`There is already a trigger with that name in my database.\n\n${commands.add_trigger} ${commands.edit_trigger} ${commands.remove_trigger}`);
            }
            else{
                config.comms[cmd.options.getString("name").toLowerCase()]=cmd.options.getString("response");
                cmd.reply(`I have logged \`${config.prefix}${cmd.options.getString("name")}\` to my triggers.\n\n\`\`\`\n${cmd.options.getString("response")}\`\`\``);
                save();
            }
        break;
        case "edit_trigger":
            if(!config.comms.hasOwnProperty(cmd.options.getString("name").toLowerCase())){
                cmd.reply(`There is no trigger with that name in my database.\n\n${commands.add_trigger} ${commands.edit_trigger} ${commands.remove_trigger}`);
            }
            else{
                config.comms[cmd.options.getString("name").toLowerCase()]=cmd.options.getString("response");
                cmd.reply(`I have edited the trigger \`${config.prefix}${cmd.options.getString("name")}\`.\n\n\`\`\`\n${cmd.options.getString("response")}\`\`\``);
                save();
            }
        break;
        case "remove_trigger":
            if(!config.comms.hasOwnProperty(cmd.options.getString("name").toLowerCase())){
                cmd.reply(`There is no trigger with that name in my database.\n\n${commands.add_trigger} ${commands.edit_trigger} ${commands.remove_trigger}`);
            }
            else{
                delete config.comms[cmd.options.getString("name").toLowerCase()];
                cmd.reply(`I have removed \`${config.prefix}${cmd.options.getString("name")}\` from my triggers.`);
                save();
            }
        break;
        case "help":
            cmd.reply(`**Help Menu**\nTriggers${Object.keys(config.comms).map(a=>`\n- ${config.prefix}${a}`).join("")}\nSlash Commands${Object.keys(commands).map(a=>`\n${commands[a]}`).join("")}`);
        break;
        case "ping":
            cmd.reply(`**Pong!**\n\n- Latency: ${client.ws.ping}ms\n- Last Started: <t:${Math.round(lastStarted/1000)}:f> <t:${Math.round(lastStarted/1000)}:R>`);
        break;
        case "hint":
            if(cmd.options.getAttachment("spoiler_log")?.attachment){
                await fetch(cmd.options.getAttachment("spoiler_log").attachment).then(d=>d.text()).then(d=>{
                    parseString(d,(e,result)=>{
                        result.poster=cmd.user.id;
                        fs.writeFileSync("./latestSpoiler.json",JSON.stringify(result));
                    });
                });
            }
            cmd.reply({content:searchLog(cmd.options.getString("item")?.toLowerCase()),allowedMentions:{parse:[]}});
        break;
        case "changePrefix":
            config.prefix=cmd.options.getString("prefix");
            save();
            cmd.reply(`I have changed the prefix for triggers to \`${config.prefix}\`.`);
        break;
    }
});
client.login(process.env.discordToken);
