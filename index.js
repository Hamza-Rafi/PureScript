const axios = require("axios");
const cheerio = require("cheerio");

// CHANGE THIS URL TO YOUR OWN URL.
// BUT REMEMBER TO LEAVE THE SLASHES AT THE END.
const url =
  "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?page=";

const resSelector = "div.result-container > div > h3 > a";
const citSelector = "div.tab-container > div#cite-harvard > div.rendering";
const authorsSelector = 'p.relations';
const linkSelector = 'div.link > a';
const otherLinkSelector = 'div.doi > a';

async function GetPagePapers(number) {
  const page = await axios.get(url + number);
  let $ = cheerio.load(page.data);

  const papers = $(resSelector);


  const links = [];
  papers.each(function (_, elem) {
      links.push(elem.attribs["href"]);
  });

  const promiseList = links.map((l) => axios.get(l));
  const data = await Promise.all(promiseList);
  return data.map((d) => {
    $ = cheerio.load(d.data);
    const text = $(citSelector).text();
    const textHtml = $('div.tab-container > div#cite-harvard > div.rendering').html();

    text.replace(/'/g, "");

    const authors = $(authorsSelector).html();

    const doi1 = $(linkSelector).attr()?.href;
    const doi2 = $(otherLinkSelector).attr()?.href;
    
    const doi = doi1 === undefined ? doi2 : doi1;

    const split = textHtml.split(/[0-9]{4}/);
    split.shift();
    split[0] = split[0].slice(2);

    let returnText = split.reduce((p, n) => p + n, "");
    const lastLink = returnText.lastIndexOf('<a onclick="window.open(this.href)');
    if (lastLink > 2) {
      returnText = returnText.slice(0, lastLink);
      if (doi) {
        returnText += `<a href="${doi}">${doi}</a>`
      }
    }

    return authors + " " + returnText;
  });
}

async function Main() {
  let pageCounter = 0;
  let papers = [0];
  let totalRefs = [];
  while (papers.length > 0) {
    papers = await GetPagePapers(pageCounter);
    pageCounter++;
    totalRefs = [...totalRefs, ...papers];
  }
  console.log("Total amount of papers:", totalRefs.length);
  let counter = totalRefs.length;
  for (const r of totalRefs) {
    console.log(`[${counter}] ` + r.replace('\n', '').trim());
    console.log();
    counter--;
  }
}

Main();
