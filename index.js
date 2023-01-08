const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs')

const papersUrl = "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?page=0";
const conferenceContributionUrl = "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?type=/dk/atira/pure/researchoutput/researchoutputtypes/contributiontobookanthology/conference&page="
const chaptersUrl = "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?type=/dk/atira/pure/researchoutput/researchoutputtypes/contributiontobookanthology/chapter&page="
const articlesUrl = "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?type=/dk/atira/pure/researchoutput/researchoutputtypes/contributiontojournal/article&page="
const otherContributionsUrl = "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?type=/dk/atira/pure/researchoutput/researchoutputtypes/othercontribution/other&type=/dk/atira/pure/researchoutput/researchoutputtypes/contributiontobookanthology/other&page="
const specialIssuesUrl = "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?type=/dk/atira/pure/researchoutput/researchoutputtypes/contributiontojournal/special&page="

const linkSelector = "div.result-container > div > h3 > a";

async function GetPageElements(url, number) {

    console.log(`Page: ${number}`)
    const page = await axios.get(url + number);
    let $ = cheerio.load(page.data);

//   get all pagelinks for publications
    const elementLink = $(linkSelector);
    const links = [];
    elementLink.each(function (_, elem) {
        links.push(elem.attribs["href"]);
    });

//   fetch data from every page
    const promiseList = links.map((l) => axios.get(l));
    const data = await Promise.all(promiseList);
    return data.map((d, i) => {
        $ = cheerio.load(d.data);

        const title = $('div.rendering>h1>span').text()
        const titleLink = links[i]
        const publishDate = $('tr.status>td>span.date').text()
        const authorElement = $('p.relations.persons>a')

        const authorNames = $('p.relations.persons').text().split(', ')

        const authors = []
        authorElement.each(function(_, elem){
            authors.push({
                name: $(this).text(),
                link: elem.attribs["href"]
            })
        })

        // author formatting
        authorNames.forEach((authorName, i) => {
            authors.forEach(author => {
                if(author.name == authorName){
                    authorNames[i] = author
                }
            });
        })
        authorNames.forEach((element, i) => {
            if(typeof element != 'object'){
                authorNames[i] = {
                    name: element
                }
            }
        })

        return {
            title: title,
            titleLink: titleLink,
            publishDate: publishDate,
            authors: authorNames
        }
    });
}
async function GetElements(url){
    let pageCounter = 0;
    let papers = [0];
    let totalRefs = [];

    console.log(url)

    while (papers.length > 0) {
        papers = await GetPageElements(url, pageCounter);
        
        pageCounter++;
        totalRefs = [...totalRefs, ...papers];
    }

    console.log("Done")
    return totalRefs
}

async function Main() {
    console.log("started")
    
    var conferenceContributions = await GetElements(conferenceContributionUrl)
    var chapters = await GetElements(chaptersUrl)
    var articles = await GetElements(articlesUrl)
    var papers = await GetElements(papersUrl);
    var otherCOntributions = await GetElements(otherContributionsUrl)
    var specialIssues = await GetElements(specialIssuesUrl)

    jsonObj = {
        "conference-contributions": conferenceContributions,
        "chapters": chapters,
        "articles": articles,
        "papers": papers,
        "other-contributions": otherCOntributions,
        "special-issues": specialIssues
    }

    fs.writeFile('publications.json', JSON.stringify(jsonObj, null, 4), (err) => {
        if (err){
            console.log(err)
        }
    })

}

Main();
