import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const athletes = JSON.parse(await fs.readFile('./output_athlete.json', 'utf8'));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeAthleteTeam() {
  const athletes_with_team = [];
  const browser = await puppeteer.launch({ headless: false }); // Launch browser
  const page = await browser.newPage(); // Open a new page

  try {
    // Navigate to ESPN
    await page.goto('https://www.espn.com/search/', { waitUntil: 'networkidle2' });

    // await page.click('#global-search-trigger');
    // await page.waitForSelector('#global-search-input', { visible: true });
    for (let idx = 0; idx < athletes.length; idx++) {
      const _athlete = athletes[idx];
      const athleteName = athletes[idx]["full_name"];
      // await page.type('#global-search-input', athleteName, { delay: 100 });
      await page.type('input.SearchBar__Input', athleteName, { delay: 100 });
      await page.keyboard.press('Enter');
      // await page.waitForSelector('.search_results__suggestions li', { visible: true });
      // const result = await page.$('.search_results__suggestions li');
      // if (result) {
      //   const teamName = await result.$eval('.search_results__cat', (el) => el.innerText.trim());
      //   console.log(`Athlete: ${athleteName}, Team: ${teamName}`);
      //   _athlete["team"] = teamName;
      //   console.log(_athlete);
      //   athletes_with_team.push(_athlete);
      // } else {
      //   console.log(`No results found for ${athleteName}`);
      // }
      await sleep(2000)
      try {
        await page.waitForSelector('section.Card', { visible: true });
        const result = await page.$('section.Card')
        if (result) {
          const teamName = await result.$eval('div.LogoTile__Meta--subtitle', (el) => el.innerText.trim());
          console.log(`Athlete: ${athleteName}, Team: ${teamName}`);
          _athlete["team"] = teamName;
          athletes_with_team.push(_athlete);
        }
      } catch {
          _athlete["team"] = "NA";
          athletes_with_team.push(_athlete);
          console.log(`Athlete: ${_athlete["full_name"]}, Team: ${_athlete["team"]}`);
      }

      //await page.click('.SearchBar__ClearButton');
      const inputValue = await page.$eval('input.SearchBar__Input', (el) => el.value);
      for (let i = 0; i < inputValue.length; i++) {
        await page.keyboard.press('Backspace');
      }
      // await page.click('#global-search-trigger');
      // await page.waitForSelector('#global-search-input', { visible: true, delay: 200 });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }

  const jsonData = JSON.stringify(athletes_with_team, null, 2);
  await fs.writeFile('athletes_full.json', jsonData, 'utf8');
}

// Example usage
scrapeAthleteTeam();

