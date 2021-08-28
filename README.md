# Twitter Following Track Bot

## How to use
### 1. Install
Install bot CLI through your system
``` 
npm install -g tw-followingtrackbot
```
### 2. Set `CONSUMER_KEY` and `CONSUMER_SECRET` 
Get the secrets of your account from your [Twitter developer dashboard](https://developer.twitter.com/) and set with below commands.
```
ftbot set.consumer_key <YOUR_CONSUMER_KEY>
ftbot set.consumer_secret <YOUR_CONSUMER_SECRET>
```
#### 3. Add target accounts 
Add as many Twitter usernames as you want to track using this command.
```
ftbot add <TARGET_USERNAME>
```
#### 4. Start tracking
```
ftbot start
```

## Tips
The free Twitter developer account only allows you to send 15 requests in 15 minutes, so if you’re using a free account you’ll have to stick with it. To get around this, each account will track every 10 minutes by default also, there is a configuration called `track_interval` that lets you change that time and it expects a **number in seconds**. You can set it like this
```
ftbot set.track_interval 600000 
```

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

### Contributing
I would be grateful to those who helped me make the project truly perfect. So, feel free to contribute to the project.

### License
MIT