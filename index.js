const configs = require("./configs.js");
const commands = require("./src/utils/commands");
const command = require("./src/commands/allCommands");

const permissionMiddleware = require("./src/middlewares/permissionMiddleware");
const joinOrLeaveMiddleware = require("./src/middlewares/joinOrLeaveMiddleware");
const antiUnsendMiddleware = require("./src/middlewares/antiUnsendMiddleware");
const commandValidatorMiddleware = require("./src/middlewares/commandValidatorMiddleware");

commands.init({...configs, handleMatches: true});

commands.addEventMiddleware(
    antiUnsendMiddleware
);

commands.addCommandMiddleware(
    joinOrLeaveMiddleware,
    commandValidatorMiddleware,
    permissionMiddleware,
);

commands.add(command.download.tiktok, {
	params: '^downloadTiktok\\s(.*)',
	usage: configs.DEFAULT_PREFIX + "downloadTiktok <tiktok-video-url>",
	description: "Downloads videos from the tiktok",
	name: "downloadTiktok",
	hasArgs: true
});

commands.add(command.info, {
	params: '^info\\s?(.*)?', 
    usage: configs.DEFAULT_PREFIX + "info",
    description: "Shows information about SnoopBot.",
    name: "info"
});

commands.add(command.help, {
    params: '^help\\s?(.*)?', 
    usage: configs.DEFAULT_PREFIX + "help",
    description: "Shows a list of available commands.",
    name: "help"
});

commands.add(command.join, {
	params: '^join\\s?(.*)?',
    usage: configs.DEFAULT_PREFIX + "join",
    description: "Allows SnoopBot to respond to every commands in a conversation.",
    name: "join"
});

commands.add(command.leave, {
	params: '^leave\\s?(.*)?', 
    usage: configs.DEFAULT_PREFIX + "leave",
    description: "Prevents SnoopBot from responding to every commands in a conversation.",
    name: "leave"
});

commands.add(command.permission.grant, {
	params: '^permission\\sgrant\\s([^@]+)\\s(.*)',
	usage: configs.DEFAULT_PREFIX + "permission grant <all | command> <all | person-name>",
	description: "Grants permission to all or a specific command to all members or specific member of a conversation.",
	name: "permission-grant"
});

commands.add(command.permission.revoke, {
	params: '^permission\\srevoke\\s([^@]+)\\s(.*)',
	usage: configs.DEFAULT_PREFIX + "permission revoke <all | command> <all | person-name>",
	description: "Revokes permission to all or a specific command to all members or a specific member of a conversation.",
    name: "permission-revoke"
});

commands.add(command.permission.list, {
	params: '^permission\\slist\\s?(.*)?',
	usage: configs.DEFAULT_PREFIX + "permission list <all | person-name>",
	description: "Lists permissions that are granted to all or a specific member of a conversation.",
	name: "permission-list"
});