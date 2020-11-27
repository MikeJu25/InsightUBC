CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open("POST", "http://localhost:4321/query");
        req.setRequestHeader("Content-type", "application/json");
        req.send(JSON.stringify(query));
        req.onload = () => {
            if(req.status === 200) {
                resolve(req.responseText);
            } else {
                reject(req.responseText);
            }
        };
    });
};
