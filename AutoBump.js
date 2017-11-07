//Script to call specific commmands with different cooldowns
//Meant for educational purpose, I'm not responsible for any damage done with this script.

const Discord = require('discord.js')
const client = new Discord.Client()

const channelID = '1243567'
const token = ''

//CD in hours; name is command to execute
const commands = [
  {
    name: 'b.bump',
    cd: 5
  },
  {
    name: '!bump',
    cd: 3
  }
]

client.on('ready', () => {
  const channel = client.channels.get(channelID)
  if (!channel) return console.error("Cloudn't find channel " + channelID)
  for (i = 0; i < commands.length; i++) {
    ;(function(i) {
      setInterval(function() {
        channel.send(commands[i].name)
      }, commands[i].cd * 3600000)
    })(i)
  }
})

client.login(token)

//ToDO Randomization, humanizer, generate nonce, actually test the script x)
