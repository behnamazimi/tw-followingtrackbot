#! /usr/bin/env node
const yargs = require("yargs");
const { ft } = require(".");
const { getConfig, setConfig, getAllTargetAccounts } = require("./data_handle");
const { successLog, bolder, logGroupStart, infoLog } = require("./logger");

yargs.scriptName("ftbot")
    .usage('$0 <command>')
    .command('start', 'start tracking', (yargs) => { }, function (argv) {
        ft.startTracking();
    })
    .command('add [username]', 'add twitter account to track list', (yargs) => {
        yargs.positional('username', {
            type: 'string',
            describe: 'target twitter username'
        })
    }, async function (argv) {
        await ft.addTargetAccountByUsername(argv.username);
    })
    .command('unlist [username]', 'unlist an account from the track list', (yargs) => {
        yargs.positional('username', {
            type: 'string',
            describe: 'target twitter username'
        })
    }, async function (argv) {
        await ft.delistTargetAccount(argv.username);
    })
    .command('all', 'show whole track list', (yargs) => { }, async function (argv) {
        const all = await getAllTargetAccounts();
        const allKeys = Object.keys(all)
        let logMsg = 'No account in track list'
        if (allKeys.length === 0) {
            infoLog(logMsg);
            return
        }
        if (allKeys.length === 1) {
            logMsg = `There is ${allKeys.length} account in track list:`
        } else {
            logMsg = `There are ${allKeys.length} accounts in track list:`
        }
        logGroupStart(logMsg);
        allKeys.forEach(key => {
            successLog(`@${all[key].username}: ${all[key].name}`);
        })
    })
    .command('track [username]', 'track an account', (yargs) => {
        yargs.positional('username', {
            type: 'string',
            describe: 'target twitter username'
        })
    }, async function (argv) {
        await ft.trackNewFollowingByUsername(argv.username);
    })
    .command('set.consumer_key [key]', 'set twitter consumer key in config', (yargs) => {
        yargs.positional('key', {
            type: 'string',
            describe: 'twitter consumer key'
        })
    }, async function (argv) {
        await setConfig("consumer_key", argv.key);
    })
    .command('set.consumer_secret [secret]', 'set twitter consumer secret in config', (yargs) => {
        yargs.positional('secret', {
            type: 'string',
            describe: 'twitter consumer secret'
        })
    }, async function (argv) {
        await setConfig("consumer_secret", argv.secret);
    })
    .command('set.token [token]', 'set twitter API token in config', (yargs) => {
        yargs.positional('token', {
            type: 'string',
            describe: 'twitter API token'
        })
    }, async function (argv) {
        await setConfig("token", argv.token);
    })
    .command('set.track_interval [interval]', 'set track internal as ms in config', (yargs) => {
        yargs.positional('interval', {
            type: 'number',
            describe: ''
        })
    }, async function (argv) {
        await setConfig("track_interval", argv.interval);
    })
    .command('get.config', 'get all configs', () => { }, async function (argv) {
        let config = await getConfig()
        for (let conf in config) {
            successLog(`${bolder(conf)}: ${config[conf]}`)
        }
    })
    .help()
    .argv

