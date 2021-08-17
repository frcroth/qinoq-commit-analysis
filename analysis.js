'use strict';
function ajax(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(this.responseText);
        };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.send();
    });
}



class Commit {
    constructor(specObject) {
        this.hash = specObject.hash;
        this.date = specObject.date;
        this.originalAuthor = specObject.author;
        this.msg = specObject.msg;
        this.authors = this.getAuthors();
        
    }

    getAuthorFromName(name) {
        if (name == 'frcroth') return name;
        if (name == 'Linus Hagemann' || name == 'linusha') return 'linusha';
        if (name == 'Paula K' || name == 'Paula' || name == 'Paula-Kli') return 'Paula-Kli';
        if (name == 'SilvanVerhoeven' || name == 'Silvan Verhoeven') return 'SilvanVerhoeven'
        if (name == 'Tarik Alnawa' || name == 'T4rikA' || name == 'Tarik') return 'T4rikA';
        console.error(`${name} could not be converted to a github user name`);
    }

    getAuthors() {
        let authors = new Set();
        authors.add(this.getAuthorFromName(this.originalAuthor));
        const author_names = ['frcroth', 'linusha', 'Paula-Kli', 'SilvanVerhoeven', 'T4rikA'];
        author_names.forEach(author_name => {
            if (this.msg.includes(author_name)){
                authors.add(author_name);
            }
        });
        return Array.from(authors);
    }

}

async function startAnalysis() {
    let commitSpecs = JSON.parse(await ajax("commits.json"));
    globalThis.commits = commitSpecs.map(element => new Commit(element));
}

startAnalysis();
