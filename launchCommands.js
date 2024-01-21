process.env=require("./env.json");
const { REST,Routes,PermissionFlagsBits,SlashCommandBuilder,ContextMenuCommandBuilder,ApplicationCommandType,ChannelType} = require('discord.js');
const fs=require("fs");

const commands = [
	new SlashCommandBuilder().setName("add_trigger").setDescription("Add a command for the bot to have available").addStringOption(option=>
			option.setName("name").setDescription("The name of the trigger? (For example: !name)").setRequired(true)
		).addStringOption(option=>
			option.setName("response").setDescription("The response for me to send when the command is sent. Remember to use proper grammar!").setRequired(true)
		).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).setDMPermission(false),//Don't allow in DMs because it's easier to check permissions in the server
	new SlashCommandBuilder().setName("edit_trigger").setDescription("Edit a command for the bot to have available").addStringOption(option=>
			option.setName("name").setDescription("The name of the trigger? (For example: !name)").setRequired(true)
		).addStringOption(option=>
			option.setName("response").setDescription("The response for me to send when the command is sent. Remember to use proper grammar!").setRequired(true)
		).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).setDMPermission(false),
	new SlashCommandBuilder().setName("remove_trigger").setDescription("Remove a command for the bot to have available").addStringOption(option=>
			option.setName("name").setDescription("The name of the trigger? (For example: !name)").setRequired(true)
		).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).setDMPermission(false),
	new SlashCommandBuilder().setName("ping").setDescription("Check latency and uptime stats"),
	new SlashCommandBuilder().setName("help").setDescription("View a list of triggers and commands"),
	new SlashCommandBuilder().setName("hint").setDescription("Search a spoiler log for a hint").addStringOption(option=>
			option.setName("item").setDescription("The item to look for")
		).addAttachmentOption(option=>
			option.setName("spoiler_log").setDescription("Upload a new Spoiler Log to search through")
		),
	new SlashCommandBuilder().setName("change_prefix").setDescription("Change the prefix my triggers respond to").addStringOption(option=>
			option.setName("prefix").setDescription("The new prefix").setRequired(true)
		).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).setDMPermission(false)
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.discordToken);
var comms={};
rest.put(Routes.applicationCommands(process.env.clientId),{body:commands}).then(d=>{
	d.forEach(c=>{
		comms[c.name]=`</${c.name}:${c.id}>`;
		if(c.hasOwnProperty("options")){
			c.options.forEach(o=>{
				if(o.type===1){
					comms[`${c.name} ${o.name}`]=`</${c.name} ${o.name}:${c.id}>`
				}
			});
		}
	});
	fs.writeFileSync("./commands.json",JSON.stringify(comms));
	console.log("Updated commands and wrote command mentions to ./commands.json");
}).catch(console.error);