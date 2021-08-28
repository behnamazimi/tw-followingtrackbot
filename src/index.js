const { FollowingTrack } = require('./following_track');
const { errorLog, successLog } = require('./logger');

const ft = new FollowingTrack()

ft.on('new_following', async (res) => {
  successLog(`@${res.username} started to follow ${res.newFollowing.count} accounts in the last ${res.duration}`);
  res.newFollowing.all.forEach(nf => {
    successLog(`➖ ${nf.name} (https://twitter.com/${nf.username})`)
  })
})

ft.on('new_error', (e) => errorLog(e.message || e))

module.exports = { ft }