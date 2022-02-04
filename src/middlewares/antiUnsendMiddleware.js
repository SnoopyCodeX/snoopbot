const fs = require("fs");
const axios = require("axios");
const streams = require("stream");
const configs = require("../../configs");

let msgs = {};

const bufferToReadable = (buffer) => {
	let readable = new streams.Readable({ read() {} });
	readable.push(buffer);
	readable.push(null);
	
	return readable;
};

const getExt = (filetype) => {
	return filetype === "photo" ? ".jpg" :
	    filetype === "audio" ? ".mp3" :
	    filetype === "animated_image" ? ".gif" :
	    filetype === "video" ? ".mp4" : 
	    filetype === "sticker" ? ".png" : "";
};

module.exports = (next) => {
	return async (event, api) => {
		let jsonString = fs.readFileSync(configs.APP_PERMISSION_FILE, {encoding: "utf8"});
		let admins = JSON.parse(jsonString);
		
		let attachments = event.attachments;
		let messageID = event.messageID;
		let senderID = event.senderID;
		let threadID = event.threadID;
		let message = event.body;
		
		switch(event.type) {
			case "message":
			case "message_reply":
			
			    if(attachments.length !== 0)
			        msgs[messageID] = attachments;
			
			    if(message.length !== 0)
			        if(msgs[messageID] !== undefined)
			            for(let msg of msgs[messageID])
                            msg.msg = message;
			        else
			            msgs[messageID] = message;
			
			break;
			
			case "message_unsend":
			    if(!admins.admins.includes(senderID)) {
				    let deletedMessages = msgs[messageID];
				
				    if(typeof (deletedMessages) !== "object") {
				        api.getUserInfo(senderID, (err, info) => {
					        if(err) return console.log(err);
					
					        let user = info[senderID];
					        let msg = {
						        body: `🤭 @${user.firstName} unsent this message: \n\n${deletedMessages}\n\n🚧 Anti-Unsend by SnoopBot`,
						        mentions: [{
							        tag: `@${user.firstName}`,
							        id: senderID
						        }]
						    };
						
						    api.sendMessage(msg, threadID);
					    });
					}
					else {
						// Loop through all deleted attachments
						for(let deletedMessage of deletedMessages) {
						    // For messages that contains, urls
						    if(deletedMessage.type === "share") {
							    api.getUserInfo(senderID, (err, info) => {
								    if(err) return console.log(err);
								
						            let user = info[senderID];
						            let msg = {
						                body: `🤭 @${user.firstName} unsent this message: \n\n${deletedMessage.msg}\n\n Anti-Unsend by SnoopBot`,
						                mentions: [{
							                tag: `@${user.firstName}`,
							                id: senderID
						                }]
				                    };
						            
						            api.sendMessage(msg, threadID);
						        });
							    
							    continue;
						    }
						}
						
						let streams = [];
						let paths = [];
						
						for(let deletedMessage of deletedMessages) {
						    let url = deletedMessage.type !== "photo" ? deletedMessage.url : deletedMessage.largePreviewUrl;
						    let ext = getExt(deletedMessage.type);
						    let path = `${__dirname}/attachment-${deletedMessage.ID + ext}`;
						
						    let response = await axios.get(url , {responseType: "arraybuffer"});
						    let data = null;
						    
						    if(response.status === 200)
						        data = response.data;
						    else
						        return console.log(response);
						
						    let readStream = bufferToReadable(Buffer.from(data, "utf-8"));
						    let writeStream = fs.createWriteStream(path);
						    readStream.pipe(writeStream);
						
						    streams.push(fs.createReadStream(path));
						    paths.push(path);
						}
						
						api.getUserInfo(senderID, (err, info) => {
							if(err) return console.log(err);
							    
			                let user = info[senderID];
					        let msg = {
						        body: `🤭 @${user.firstName} unsent these attachment(s): \n\n${deletedMessages[0].msg || ""}`,
						        mentions: [{
                                    tag: `@${user.firstName}`,
                                    id: senderID
                                }],
						        attachment:  streams
				            };
						
						    api.sendMessage(msg, threadID);
						});
						
						for(let path of paths)
						    fs.unlink(path, (err) => {
							    if(err) return console.log(err);
							
							    console.log("Deleted: " + path);
                            });
					}
				}
			break;
		};
		
		await next(event, api);
	};
};