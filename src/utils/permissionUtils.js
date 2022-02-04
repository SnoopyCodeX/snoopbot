const fs = require("fs");
const configs = require("../../configs.js");

const userHasPermission = (threadID, userID, ...commands) => {
	let jsonString = fs.readFileSync(configs.APP_PERMISSION_FILE, {encoding: "utf8"});
	let permissions = JSON.parse( jsonString === "" ? "{}" : jsonString);
	let hasPermission = false;
	
	if(permissions.admins.includes(userID))
	    return true;
	
	if(permissions[threadID] !== undefined) {
		let users = permissions[threadID].users;
		
		if(users[userID] !== undefined) {
			let user = users[userID];
			let perms = user.permissions;
			
			let count = 0;
			for(let command of commands)
			    count += perms.includes(command) ? 1 : 0;
			
			hasPermission = count === commands.length;
		}
	}
	
	return hasPermission;
};

const grant = (threadID, userID, ...commands) => {
	if(userHasPermission(threadID, userID, commands))
	    return false;
	
	let jsonString = fs.readFileSync(configs.APP_PERMISSION_FILE, {encoding: "utf8"});
	let permissions = JSON.parse( jsonString === "" ? "{}" : jsonString);
	
	permissions[threadID] = (permissions[threadID] === undefined) ? {} : permissions[threadID];
	permissions[threadID].users = (permissions[threadID].users === undefined) ? {} : permissions[threadID].users;
	permissions[threadID].users[userID] = (permissions[threadID].users[userID] === undefined) ? {} : permissions[threadID].users[userID];
	permissions[threadID].users[userID].permissions = (permissions[threadID].users[userID].permissions === undefined) ? [] : permissions[threadID].users[userID].permissions;
	
	permissions[threadID].users[userID].permissions.push(...commands);
	
	fs.writeFileSync(configs.APP_PERMISSION_FILE, JSON.stringify(permissions, undefined, 4), {encoding: "utf8"});
	return true;
};

const revoke = (threadID, userID, ...commands) => {
	if(!userHasPermission(threadID, userID, ...commands))
	    return false;
	
	let jsonString = fs.readFileSync(configs.APP_PERMISSION_FILE, {encoding: "utf8"});
	let permissions = JSON.parse( jsonString === "" ? "{}" : jsonString);
	
	if(permissions[threadID] === undefined 
        || permissions[threadID].users === undefined
        || permissions[threadID].users[userID] === undefined
        || permissions[threadID].users[userID].permissions === undefined)
        return false;
        
    if(permissions[threadID].users[userID].permissions.length === 0)
        return true;
	
	let userGrantedPerms = permissions[threadID].users[userID].permissions;
	let temp = [];
	
	for(let perm of userGrantedPerms)
	    if(!commands.includes(perm))
	        temp.push(perm);
	
	permissions[threadID].users[userID].permissions = temp;
	
	if(permissions[threadID].users[userID].permissions.length === 0)
	    delete permissions[threadID].users[userID];
	
	if(permissions[threadID].users.length === 0)
	    delete permissions[threadID].users;
	
	if(permissions[threadID].length === 0)
	    delete permissions[threadID];
	
	fs.writeFileSync(configs.APP_PERMISSION_FILE, JSON.stringify(permissions, undefined, 4), {encoding: "utf8"});
	return true;
};

module.exports = {
	userHasPermission,
	grant,
	revoke
}