function friendly(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function getFileName(uri) {
    try {
        var s = new URL(uri).pathname.split("/")
        return decodeURIComponent(s[s.length - 1])
    } catch(e) {
        return uri
    }
}


setInterval(async function() {
    var quota = await navigator.storage.estimate()
    document.querySelector("#forageMeter").max = quota.quota
    document.querySelector("#forageTotal").innerText = friendly(quota.quota)
    document.querySelector("#forageMeter").value = quota.usage
    document.querySelector("#forageUsed").innerText = friendly(quota.usage)

    var keys = await localforage.keys()

    var forageTable = `<tr><th>Filename</th><th>File size</th><th>Actions</th></tr>`
    for (var key of keys) {
        if (key.includes("_")) {
            var s = key.split("_")
            var console = s.shift()
            var gamename = s.join("_")
            forageTable += `
            <tr>
                <td class="${console}Game">${getFileName(gamename)}</td>
            </tr>`
        }
    }
    document.querySelector("#forageContainer").innerHTML = forageTable

    var localStorageSize = 0
    var i = 0
    while (true) {
        var key = localStorage.key(i)
        if (!key) { break; }
        localStorageSize += localStorage.getItem(key).length
        i += 1
    }
    document.querySelector("#lStorageMeter").value = localStorageSize
    document.querySelector("#storageUsed").innerText = friendly(localStorageSize)


},1000)

function clearForage() {
    localforage.dropInstance()
    indexedDB.deleteDatabase("localforage")
    location.reload()
}
function clearStorage() {
    if (confirm("Are you sure you want to delete ALL saves?")) {
        localStorage.clear()
    }
}