var Discord = require('discord.js');
var config = require('./config.json');

var client = new Discord.Client();

const hook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

var servers = {
  '303294685579968512': 'HesaEngine',
  '304625179240300544': 'EloSuite',
  '158704537576800256': 'EloBuddy',
  '244232821839757323': 'GamingOnSteroids',
  //'272259406090207232': 'AimTec',
  '318864812387991558': 'Entropy',
};

//Preventing circular dependencies
//Taken from: http://www.johnantony.com/pretty-printing-javascript-objects-as-json/
function JSONStringify(object) {
    var cache = [];
    var str = JSON.stringify(object,
        // custom replacer fxn - gets around "TypeError: Converting circular structure to JSON"
        function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }, 4);
    cache = null; // enable garbage collection
    return str;
};

client.on('ready', () => {
    var g = client.guilds.array();
    for (i=0;i<g.length;i++)
    {
      console.log("Listening on " + g[i].name);
    }
  }
);

client.on('message', message => {
  if (servers[message.channel.id]) {
    var options = {
        'username': message.author.username,
        'avatarURL': message.author.avatarURL,
        'disableEveryone': true,
    };
    if (message.embeds[0]) {
      var e = message.embeds[0];
      options.embeds = [JSON.parse(JSONStringify(message.embeds[0]))];
    }
    hook.send("**From " + servers[message.channel.id] + "**:\n" + message.toString(),options);
  }
});

client.login(config.zombie.token);
