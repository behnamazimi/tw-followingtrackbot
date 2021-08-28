# Twitter Following Track Bot

## How to use
1. Install first
``` npm install -g tw-followingtrackbot```
2. Get `CONSUMER_KEY` and `CONSUMER_SECRET` from your Twitted developer dashboard and set with below commands
```
ftbot set.consumer_key <YOUR_KEY>
ftbot set.consumer_secret <YOUR_SECRET>
```
3. Add target accounts by below command
```ftbot add <TARGET_USERNAME>```
4. Start tracking
```ftbot start```


## CLI help

```bash
ftbot <command>

Commands:
  ftbot start                          Start tracking
  ftbot add [username]                 Add twitter account to track list
  ftbot unlist [username]              Unlist an account from the track list
  ftbot track [username]               Track an account
  ftbot set.consumer_key [key]         Set twitter consumer key in config
  ftbot set.consumer_secret [secret]   Set twitter consumer secret in config
  ftbot set.token [token]              Set twitter API token in config
  ftbot set.track_interval [interval]  Set track internal as ms in config
  ftbot get.config                     Get all configs

Options:
  --version  Show version number
  --help     Show help
```