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
        this.title = specObject.caption;
        this.authors = this.getAuthors();
        this.titleTokens = this.title.split(" ").map(string => string.toLowerCase());
    }

    static getAuthorNames() {
        return ['frcroth', 'linusha', 'Paula-Kli', 'SilvanVerhoeven', 'T4rikA'];
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
        Commit.getAuthorNames().forEach(authorName => {
            if (this.msg.includes(authorName)) {
                authors.add(authorName);
            }
        });
        return Array.from(authors);
    }

    static getCommitsWithAuthors(authorsList) {
        return globalThis.commits.filter(commit => authorsList.every(author => commit.authors.includes(author)));
    }

    static getAllTitleTokens() {
        return globalThis.commits.flatMap(commit => commit.titleTokens);
    }

}

async function startAnalysis() {
    let commitSpecs = JSON.parse(await ajax("commits.json"));
    globalThis.commits = commitSpecs.map(element => new Commit(element));

    // create table for collaboration
    let permutations = Commit.getAuthorNames().flatMap(author => Commit.getAuthorNames().map(author2 => [author, author2]));
    permutations = permutations.map(permutation => permutation[0] != permutation[1] ? permutation : [permutation[1]]);

    let commitCounts = permutations.map(permutation => [permutation, Commit.getCommitsWithAuthors(permutation)]);

    createPermutationCountTable(commitCounts);
    analyzeCommitTitleTokens();
    analyzeCommitTitleDuplicates();
}

function createPermutationCountTable(commitCounts) {
    let table = document.createElement("table");
    table.classList.add("table")
    let elements = [""];
    elements = elements.concat(Commit.getAuthorNames());
    elements = [...elements, ...commitCounts.map(commitCount => commitCount[1].length)];
    Commit.getAuthorNames().forEach((authorName, index) => elements.splice((index + 1) * 6, 0, authorName));
    globalThis.tableElements = elements;
    let tableContent = "";
    elements.forEach((element, index) => {
        if (index % 6 == 0) {
            tableContent = tableContent + "<tr>";
        }
        tableContent = tableContent + `<td>${element}</td>`;
        if (index % 6 == 5) {
            tableContent = tableContent + "</tr>";
        }
    });
    table.innerHTML = tableContent;
    document.getElementById("table-container").appendChild(table);
}

function analyzeCommitTitleTokens() {
    let allTokens = Commit.getAllTitleTokens();
    let counts = new Map();
    allTokens.forEach(token => counts.set(token,1 + counts.get(token) || 0));
    let mostCommonCommitTokens = Array.from(counts.entries()).sort((a,b) => b[1] - a[1]);
    let listOfMostCommonCommitTokens = document.createElement("ol");
    mostCommonCommitTokens.slice(0,10).forEach(pair => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `${pair[0]}: ${pair[1]} times`;
        listOfMostCommonCommitTokens.appendChild(listItem);
    });
    document.getElementById("commit-tokens-container").appendChild(listOfMostCommonCommitTokens);
}

function analyzeCommitTitleDuplicates() {
    let allTokens = globalThis.commits.map(commit => commit.title);
    let counts = new Map();
    allTokens.forEach(token => counts.set(token,1 + counts.get(token) || 0));
    let mostCommonTitles = Array.from(counts.entries()).sort((a,b) => b[1] - a[1]);
    mostCommonTitles = mostCommonTitles.filter(pair => pair[1] > 1);
    let listOfMostCommonCommitTitles = document.createElement("ol");
    mostCommonTitles.forEach(pair => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `${pair[0]}: ${pair[1]} times`;
        listOfMostCommonCommitTitles.appendChild(listItem);
    });
    document.getElementById("commit-titles-container").appendChild(listOfMostCommonCommitTitles);
}

startAnalysis();
