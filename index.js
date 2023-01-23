// const axios = require("axios");
import axios, { all } from 'axios'
// const cheerio = require("cheerio");
import cheerio from 'cheerio';
// const fs = require('fs')
import * as fs from 'fs'
import { type } from 'os';
// import data from './publications.json' assert {type: 'json'}
import chapters from './chapters.json' assert {type: 'json'}

const papersUrl = "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?page=0";

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

        // const placePublished = ${''}

        const doiText = $('div.doi>a>span').text()
        var doiLink;
        $('div.doi>a.link').each(function (_, elem) {
            doiLink = elem.attribs["href"];
        });

        var doi = {}
        if(doiText != ''){
            doi = {
                text: doiText,
                link: doiLink
            }            
        }

        const linkText = $('div.link>a>span').text()

        const journal = $('td>a.link[rel]>span').text()



        return {
            title: title,
            titleLink: titleLink,
            publishDate: publishDate,
            authors: authorNames,
            doi: doi,
            links: linkText,
            journal: journal
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
    
    // var conferenceContributions = await GetElements(conferenceContributionUrl)
    // var chapters = await GetElements(chaptersUrl)
    // var articles = await GetElements(articlesUrl)
    // var otherCOntributions = await GetElements(otherContributionsUrl)
    // var specialIssues = await GetElements(specialIssuesUrl)
    var papers = await GetElements(papersUrl);

    // var allEntries = []
    // for(const [key, value] of Object.entries(jsonObj)){
    //     if(key == 'allPublications') {continue}
    //     allEntries.push(...value)
    // }
    papers = [...papers, ...chapters]

    papers.sort((a, b) => {
        return new Date(b.publishDate) - new Date(a.publishDate)
    })

    var jsonObj = [...papers]

    fs.writeFile('publications.json', JSON.stringify(jsonObj, null, 4), (err) => {
        if (err){
            console.log(err)
        }
    })
}

Main();
