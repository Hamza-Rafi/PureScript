const axios = require("axios");
const cheerio = require("cheerio");

const url =
  "https://pure.royalholloway.ac.uk/en/persons/konstantinos-markantonakis/publications/?page=";
const resSelector = "div.result-container > div > h3 > a";
const citSelector = "div.tab-container > div#cite-harvard";

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
    return text;
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
  for (const r of totalRefs) {
    console.log(r.replace('\n', ''));
  }
}

Main();
