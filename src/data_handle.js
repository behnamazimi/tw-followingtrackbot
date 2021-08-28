const fs = require('fs');
const targetAccountFileName = "src/data.json";
const configFileName = "src/config.json";

function getConfig() {
    return getFileJsonContent(configFileName)
}

async function setConfig(key, value) {
    return new Promise(async (resolve, reject) => {
        try {
            let conf = await getConfig();
            conf[key] = value || null;
            await writeToFile(configFileName, JSON.stringify(conf, null, 2));
            resolve(conf);
        } catch (e) {
            reject(e);
        }
    });
}

function getFileJsonContent(fileName) {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(fileName)) {
                fs.writeFileSync(fileName, "");
            }
            let content = fs.readFileSync(fileName)
            let jsonContent = null
            try {
                jsonContent = JSON.parse(content);
            } catch (err) {
                jsonContent = {};
            }
            resolve(jsonContent);
        } catch (err) {
            reject(err);
        }
    });
}

function writeToFile(fileName, content) {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(fileName)) {
                fs.writeFileSync(fileName, "");
            }

            fs.writeFileSync(fileName, content)
            resolve(true);
        } catch (err) {
            reject(err);
        }
    });

}

async function upsertTargetAccount(dataObj) {
    return new Promise(async (resolve, reject) => {
        try {
            let all = await getAllTargetAccounts();
            all[dataObj.id] = dataObj;
            await writeToFile(targetAccountFileName, JSON.stringify(all, null, 2));
            resolve(all);
        } catch (e) {
            reject(e);
        }
    });
}

async function deleteTargetAccount(username) {
    return new Promise(async (resolve, reject) => {
        try {
            const all = await getAllTargetAccounts();
            const targetId = Object.keys(all).filter(key => all[key].username === username)[0];
            delete all[targetId];
            await writeToFile(targetAccountFileName, JSON.stringify(all, null, 2));
            resolve(all);
        } catch (e) {
            reject(e);
        }
    });
}

function getAllTargetAccounts() {
    return getFileJsonContent(targetAccountFileName)
}

function getTargetAccountByUsername(username) {
    return new Promise(async (resolve, reject) => {
        const all = await getFileJsonContent(targetAccountFileName)
        const targetId = Object.keys(all).filter(key => all[key].username.toLowerCase() === username.toLowerCase())[0];
        resolve(all[targetId]);
    })
}

module.exports = {
    getConfig,
    setConfig,
    getAllTargetAccounts,
    upsertTargetAccount,
    deleteTargetAccount,
    getTargetAccountByUsername,
}