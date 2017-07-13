const Discord = require('discord.js');
 const config = require('./config.json');
 const sentiment = require('sentiment');
 const fs = require('fs');
 var request = require('request');
 var http = require('http');
 var karma = {};
 var settings = {};
 var spamLock = {};
 try {
 	karma = require('./karma.json');
 }
 catch (ex) {
 	fs.writeFile("./karma.json",JSON.stringify(karma),function(){});
 }
 try {
	 settings = require('./settings.json');
 }
 catch (ex) {
	 fs.writeFile("./settings.json",JSON.stringify(settings),function(){});
 }

 const client = new Discord.Client();

 function getReq(page,callBack) {

 	var content = "";

 	var req = http.request(page, function(res) {
 		res.setEncoding("utf8");
 		res.on("data", function (chunk) {
 			content += chunk;
 		});

 		res.on("end", function () {
 			callBack(content);
 		});
 	});
 	req.end();
 }

 client.on('ready', () => {
 	console.log('I am ready!');
 });

 const clean = text => {
 	if (typeof(text) === 'string')
 	return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
 	else
 		return text;
 }

 function commandHandler(message)
 {
	 //Don't want to get triggered by other bots
	 if (message.author && message.author.isBot) {return false;}

	 //Check shadowbanned users
	 if (settings && settings.shadowban && message.author && settings.shadowban[message.author.id] && message.author != client.user) {return false;}

	 //Prevent spamming in locked channels
	 if (spamLock && message.channel && message.channel.id && spamLock[message.channel.id]) {return false;}

	 //Prevent commands in blocked channels
	 if (message.guild && settings.blockChannels && settings.blockChannels[message.channel.id] && message.author != client.user) {
		 spamLock[message.channel.id] = true;
     setTimeout(function() {
       spamLock[message.channel.id] = false;
     }, 15000);
		 message.reply("This channel has been blacklisted! Try another one.").then(message => message.delete(5000));
	 }

	 var msg = {};	//Create command array
	 //Check and strip prefix
	 if (message.content.startsWith(config.prefix) && message.author == client.user) {
		 msg.content = message.content.replace(config.prefix, "");
     msg.self = true;
	 }
	 else if (message.content.startsWith(config.prefix2)) {
		 msg.content = message.content.replace(config.prefix2, "");
	 }
	 else {
		 return false;
	 }

	 //Check and strip command
	 msg.command = msg.content.split(" ")[0];
	 if (!msg.command) return false;
	 msg.content = msg.content.replace(msg.command, "").substring(1);

	 //Get mentions
	 if (message.mentions && message.mentions.users && message.mentions.users.first()) {
     msg.mention = message.mentions.users.first();
   }

	 return msg;
 }

 client.on('message', message => {

  //sentiment analysis detection
	var senti = sentiment(message.content);

  //Score handler
 	if (message.author.id) {
 		if (!karma[message.author.id]) {
 			karma[message.author.id] = {karma: 0, count: 0}
 		}
 		karma[message.author.id].karma += senti.comparative;
 		karma[message.author.id].count++;
 		fs.writeFile("./karma.json",JSON.stringify(karma),function(){});
 	}

  message.content = message.content.replace("\n", " ");

  //Call commandHandler and exit when message is on command
  var msg = commandHandler(message);
  if (!msg) return;
  console.log(msg);

  //Karma output
	if (msg.command == 'karma')	{
		message.reply(" you have **" + Math.floor(karma[message.author.id].karma) + " Karma**.\n*Based on " + karma[message.author.id].count + " messages.*").then(message => message.delete(60000));
    return;
  }

  //Simple Usercard
	if (msg.command == 'info')	{
 		var caller = msg.mention ? msg.mention : message.author;
 		message.channel.send({embed: {
 			color: 3447003,
 			author: {
 				name: client.user.username,
 				icon_url: client.user.avatarURL
 			},
 			thumbnail: {
 				url: caller.avatarURL
 			},
 			image: {
 				url: caller.avatarURL
 			},
 			title: caller.username + "s Usercard",
 			description: 'Simple User information',
 			fields:
 			[{
 				name: 'Created',
 				value: caller.createdAt.toDateString()
 			}, {
 				name: 'User ID',
 				value: caller.id
 			}],
 			timestamp: new Date(),
 			footer: {
 				icon_url: caller.avatarURL
 			}
 		}}).then(message => message.delete(60000));
 		return;
 	}

	if (msg.command == 'porn') {
		if (!message.channel || !message.channel.nsfw) return message.reply("that only works in #nsfw channels").then(message => message.delete(20000));
		var sub = ["bigtitsmallnip","nsfw","nsfw2","onoff","gonewild","petitegonewild","legalteens","petite","sexygirls", "realgirls","adorableporn","Boobies","ginger","TinyTits","tightdresses","suicidegirls","redheads"];
		var sub = sub[Math.floor(Math.random()*sub.length)];
		var post = Math.floor(Math.random()*18+2);
		var request = require('request');
		request('https://www.reddit.com/r/' + sub + '/.json', function (error, response, body) {
		  try {
				var json = JSON.parse(body);
				var t = 0;
				while (json.data.children[post].data.post_hint == "rich:video")  {post = Math.floor(Math.random()*18+2); t++; if (t > 5) return message.channel.send("Hard exit! Shouldn't happen! Try again").then(message => message.delete(10000));}
				console.log('https://www.reddit.com/r/' + sub + '/.json ' + post);
				message.channel.send({embed:{image:{url:json.data.children[post].data.preview.images[0].source.url}}});
			}
			catch (ex) {
				message.channel.send("Error connecting to Reddit").then(message => message.delete(10000));
				return;
			}
		});
	}

 if (msg.command == 'ver') {
 	message.channel.send("", {files: [{
 		attachment: config.server + "/LoS/render.php",
 		name: "status.png"
 		}]}).then(message => message.delete(300000));
 		return;
 }

 	//Private funcs
 	if (!msg.self) return;

 	if (msg.command == 'prune') {
 		let messagecount = parseInt(msg.content);
    if (!typeof(messagecount) == "number") return;

 		message.channel.fetchMessages({
 				limit: 100
 			})
 			.then(messages => {
 				let msg_array = messages.array();
 				msg_array = msg_array.filter(m => m.author.id === client.user.id);
 				msg_array.length = messagecount + 1;
 				msg_array.map(m => m.delete().catch(console.error));
 			});
 	}

 	if (msg.command == 'avatar') {
 		message.reply((msg.mention ? msg.mention : message.author).avatarURL);
 	}

 		if (msg.command == 'eval') {
 		try {
 			const code = msg.content;
 			let evaled = eval(code);

 			if (typeof evaled !== 'string')
 			evaled = require('util').inspect(evaled);

 		 // message.channel.send(clean(evaled), {code:'xl'});
 		} catch (err) {
 			message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
 		}
 		message.delete();
 		}
  });

 client.login(config.token);
