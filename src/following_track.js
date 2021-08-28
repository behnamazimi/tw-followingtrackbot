const axios = require('axios')
const { EventEmitter } = require('events');
const fs = require("fs")
const FormData = require('form-data');
const { upsertTargetAccount, getAllTargetAccounts, deleteTargetAccount, getTargetAccountByUsername, getConfig, setConfig } = require('./data_handle');
const { infoLog, warningLog, errorLog, successLog, logGroupEnd, logGroupStart, bolder, normalLog } = require('./logger');

class FollowingTrack extends EventEmitter {
    constructor() {
        super()
        this._targetAccounts = []
        this._token = null
        this._consumerKey = null
        this._consumerSecret = null
        this._nextIndex = 0
        this._trackInterval = 1000 * 600 // 10 minutes in ms by default
    }

    _parseTimeDuration(start, end) {
        const duration = end - start
        const minutes = Math.floor(duration / 1000 / 60)
        const hours = Math.floor(duration / 3600000)
        if (hours > 24) {
            return `${Math.floor(hours / 24)} days`
        } else if (hours > 0) {
            return `${hours} hours`
        } else {
            return `${minutes} minutes`
        }
    }

    async _fetchBearerToken() {
        if (!this._consumerKey || !this._consumerSecret) {
            const allConfigs = await getConfig()
            this._consumerKey = allConfigs.consumer_key
            this._consumerSecret = allConfigs.consumer_secret
            this._token = allConfigs.token
            this._trackInterval = +allConfigs.track_interval * 1000
        }

        if (this._token) {
            return this._token
        }

        if (!this._consumerKey || !this._consumerSecret) {
            throw new Error("consumer key or/and consumer secret not found.")
        }

        let data = new FormData();
        data.append('grant_type', 'client_credentials');

        let config = {
            method: 'post',
            url: 'https://api.twitter.com/oauth2/token',
            headers: {
                ...data.getHeaders()
            },
            auth: {
                username: this._consumerKey,
                password: this._consumerSecret,
            },
            data
        };

        try {
            const res = await axios(config)

            if (res.data.access_token) {
                this._token = res.data.access_token
                setConfig("token", this._token)
                return res.data.access_token
            } else {
                throw new Error("Can not fetch token")
            }

        } catch (e) {
            this.emit("new_error", e)
            return null
        }
    }

    async _getFollowing(userId, maxResults = 1000, paginationToken = null) {

        if (!this._token) {
            await this._fetchBearerToken()
        }

        let url = `https://api.twitter.com/2/users/${userId}/following?max_results=${maxResults}`
        if (paginationToken)
            url += `&pagination_token=${paginationToken}`

        try {
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${this._token}` }
            });
            const onlyIds = data.data.map(({ id }) => id);
            return {
                ids: onlyIds,
                count: data.data.length,
                all: data.data,
                nextPageToken: data.meta.next_token
            }
        } catch (e) {
            throw new Error(e)
        }
    }

    async getAllFollowing(userId, maxResults = 1000) {

        try {
            let data = { ids: [], all: [], count: 0 }
            let nextPageToken = null
            for (let i = 0; i < 10; i++) {
                infoLog(`fetching following list ${i * 1000} to ${(i + 1) * maxResults}`);
                let res = await this._getFollowing(userId, maxResults, nextPageToken);
                data.ids = [...data.ids, ...res.ids];
                data.all = [...data.all, ...res.all];
                data.count += res.count;
                if (res.nextPageToken) {
                    nextPageToken = res.nextPageToken
                } else {
                    break
                }
            }

            return data;
        } catch (e) {
            throw new Error(e)
        }
    }

    async _getNewFollowingByIds(userId, lastFollowingIds = []) {
        try {
            const res = await this.getAllFollowing(userId);
            const allNew = res.all.filter(f => !lastFollowingIds.includes(f.id));
            return {
                all: allNew,
                count: allNew.length,
                ids: allNew.map(f => f.id),
            }
        } catch (e) {
            throw new Error(e)
        }
    }

    async addTargetAccountByUsername(username) {
        try {
            const ta = await getTargetAccountByUsername(username)
            if (ta) {
                warningLog(`@${username} already exists`)
                return ta
            }
            if (!this._token) { await this._fetchBearerToken() }

            let url = `https://api.twitter.com/2/users/by/username/${username}`
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${this._token}` }
            });

            if (!data || !data.data || !data.data.id) {
                throw new Error(`@${username} not found`)
            }

            const allFollowing = await this.getAllFollowing(data.data.id)
            infoLog(`${allFollowing.count} following found for @${data.data.username}`);

            const newObj = {
                id: data.data.id,
                name: data.data.name,
                username: data.data.username,
                following: allFollowing.ids,
                lastChecked: Date.now()
            }
            upsertTargetAccount(newObj)

            this._targetAccounts = []
            return newObj
        } catch (e) {
            this.emit("new_error", e)
        }
    }

    async _addTargetAccountIfNotExists(username) {
        try {
            const ta = await getTargetAccountByUsername(username)
            if (ta) {
                warningLog(`@${username} already exists`)
                return ta
            } else {
                await this.addTargetAccountByUsername(username)
                infoLog(`@${username} added`)
            }
            return true
        } catch (e) {
            throw new Error(e)
        }
    }

    async addTargetAccounts(usernames) {
        return Promise.all(usernames.map(u => this._addTargetAccountIfNotExists(u)))
    }

    async trackNewFollowingByUsername(username) {
        try {
            logGroupStart(`@${username} tracking started...`)
            let ta = await getTargetAccountByUsername(username)
            if (ta) {
                return await this.updateFollowingIfExists(ta)
            }
            errorLog(`@${username} not exists in the track list`)
        } catch (e) {
            this.emit("new_error", e)
        } finally {
            logGroupEnd()
        }
    }

    async updateFollowingIfExists(ta) {
        try {
            const res = await this._getNewFollowingByIds(ta.id, ta.following);
            if (!res || !res.count) {
                normalLog(`No new following for @${ta.username}`);
                return null
            } else {
                this.emit('new_following', {
                    name: ta.name,
                    username: ta.username,
                    newFollowing: res,
                    duration: this._parseTimeDuration(ta.lastChecked, Date.now())
                })
                const updatedTA = {
                    ...ta,
                    following: [...(ta.following || []), ...res.ids],
                    lastChecked: Date.now()
                };
                await upsertTargetAccount(updatedTA);
                return res
            }
        } catch (e) {
            this.emit("new_error", e)
        }
    }

    async delistTargetAccount(username) {
        try {
            await deleteTargetAccount(username)
            infoLog(`@${username} removed from the track list`)
            this._targetAccounts = []
        } catch (e) {
            this.emit("new_error", e)
        }
    }

    async startTracking() {
        // update track interval before start 
        const allConfigs = await getConfig()
        if (allConfigs.track_interval)
            this._trackInterval = +allConfigs.track_interval * 1000

        infoLog('Tracking started...');
        infoLog(`Each account will be tracked every ${this._parseTimeDuration(0, this._trackInterval)}.`);

        if (this._tiid) {
            clearInterval(this._tiid)
            this._nextIndex = 0
            this._targetAccounts = []
        }
        const intervalCallback = async () => {
            try {
                if (!Object.keys(this._targetAccounts).length) {
                    const all = await getAllTargetAccounts()
                    this._targetAccounts = Object.keys(all).map(id => all[id])
                }

                if (this._nextIndex >= this._targetAccounts.length) {
                    this._nextIndex = 0
                }

                const ta = this._targetAccounts[this._nextIndex++]
                if (ta) {
                    await this.trackNewFollowingByUsername(ta.username)
                }
            } catch (e) {
                this.emit("new_error", e)
            }
        }
        intervalCallback()
        this._tiid = setInterval(intervalCallback, this._trackInterval)
    }
}

module.exports = {
    FollowingTrack
}