
var xml2js = require('xml2js-expat')
  , https = require('https')
  , util = require('util')
  , format = util.format
  , plugin = module.exports = {}
  ;

plugin.bug = function bug(id, channel) {
  var client = this.bot.client;
  https.get({
    host: this.config.host
  , path: '/show_bug.cgi?ctype=xml&id=' + id
  }, function(res) {
    var buf = [];
    res.on('data', function(d) { buf.push(d); });
    res.on('end', function() {
      var parser = new xml2js.Parser('UTF-8', function(result, error) {
        if (error) { console.log(error); return; }
        var bug = result.bug;
        if (bug['@'] && bug['@'].error) {
          client.say(channel, format("I'm sorry, bug %s seems to have scampered off.", bug.bug_id));
        }
        else {
          client.say(channel, format('%s | %s -> %s | %s (%s) | %s%s%s',
                                        bug.short_desc,
                                        bug.reporter['#'],
                                        bug.assigned_to['#'],
                                        bug.bug_status,
                                        bug.priority,
                                        result['@'].urlbase,
                                        'show_bug.cgi?id=',
                                        bug.bug_id
                                       ));
        }
      });
      buf = buf.join("");
      parser.parseString(buf);
    });
  }).on('error', function(e) {
    client.say(channel, 'Sorry, unable to process request at this time.');
  });
}

plugin.parseChannelMessage = function parseChannelMessage(from, to, message) {
  if (/!bug (\d+)/.test(message)) {
    this.bug(RegExp.$1, to);
  }
}

plugin.commands = function commands() {
  return {
    '!bug': 'show summary of bug'
  };
}

plugin.load = function load(bot, config){
  this.config = config;
  this.bot = bot;
  this.bot.client.addListener('message', this.parseChannelMessage.bind(this));
}
