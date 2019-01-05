#!/usr/bin/env node
//MyCHIPs production server
//TODO:
//X- Get simple server running
//X- Optionally launch various servers:
//X-   Admin SPA at https://host:(80)/admin.html
//X-   User SPA at https://host:(80)/user.html
//-   Ticket 1-way tls socket commands at host:port
//-   Admin 2-way tls socket commands at host:port
//-   User 2-way socket commands at host:port
//-   Peer 2-way socket commands at host:port
//-   Public document http server
//- Can't start on fresh database with peerPort enabled (2 simultaneous attempts to create database)
//- 
var log = require('../lib/logger')('mychips')
const OS = require('os')
const Express = require('express')
var expSPApp

var argv = require('yargs')
  .alias('h','hostID')    .default('hostID',    null)		//If peer servers run on multiple hosts, this identifies our host
  .alias('s','spaPort')	  .default('spaPort',   8000)		//Serve client SPA's at this port
  .alias('w','wgiPort')	  .default('wgiPort',   8001)		//Serve wysegi SPA at this port
  .alias('u','userPort')  .default('userPort',  43210)		//User client at this port
  .alias('a','adminPort') .default('adminPort', 54320)		//Admin client at this port
  .alias('p','peerPort')  .default('peerPort',  65430)		//Peer-to-peer connections at this port
  .alias('m','model')     .default('model', false)		//Run agent-based model
  .argv;

log.trace("Host ID:    ", argv.hostID)
log.trace("SPA Port:   ", argv.spaPort)
log.trace("Wysegi Port:", argv.wgiPort)
log.trace("Admin Port: ", argv.adminPort)
log.trace("User Port:  ", argv.userPort)
log.trace("Peer Port:  ", argv.peerPort)
log.trace("Agent Model:", argv.model)

if (Boolean(argv.spaPort)) {				//Create http server for client SPAs
    expSPApp = Express()
    expSPApp.use(Express.static('pub'))
    expSPApp.listen(argv.spaPort)
    log.debug("Serving client SPA's at port:", argv.spaPort)
}

if (Boolean(argv.wgiPort)) {				//Create http server for wysegi SPA
    app = Express();
    app.use(Express.static('node_modules/wylib/dist'))
    app.listen(argv.wgiPort)
    log.debug("Serving wysegi SPA at port:", argv.wgiPort)
}

if (Boolean(argv.adminPort)) {				//Create socket server for admin data
  const AdminCont = require('../lib/admin.js')		//Admin client connection controller
  var admin = new AdminCont(argv.adminPort, expSPApp)
}

//if (Boolean(argv.userPort)) {				//Create socket server for user data
//  const UserCont = require('../lib/user.js')		//User client connection controller
//  var user = new UserCont(argv.userPort)
//}

if (Boolean(argv.peerPort)) {				//Create socket server for peer-to-peer communications
  const PeerCont = require('../lib/peer.js')		//Peer communications controller
  var peer = new PeerCont(argv.peerPort, argv.hostID)
}

if (Boolean(argv.model)) {				//Run agent-based simulation model
  const AgentCont = require('../lib/agent.js')		//Model controller
  var agent = new AgentCont()
}
