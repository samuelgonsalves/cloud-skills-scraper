require('dotenv').config();
const cheerio = require('cheerio');
const axios = require('axios');

const siteUrl = `https://www.microsoft.com/en-us/cloudskillschallenge/Public/Contests/${process.env.CONTEST_KEY}`;
const profilesBaseUrl = "https://docs.microsoft.com/api/profiles/";
const gameStatusBaseUrl = "https://docs.microsoft.com/api/gamestatus/"

const fetchMicrosoftContestData = async function() {
    const result = await axios.get(siteUrl);
    return cheerio.load(result.data);
};

const getSiteData = async function() {
    const $ = await fetchMicrosoftContestData();
    var profiles = $('tr > td > small > span');

    const results = [];
    const delay = () => new Promise(resolve => setTimeout(resolve, 5000));
    profiles.each(async function() {
        var subSiteUrl =  $(this).text();
        var userProfile = subSiteUrl
            .replace("https://docs.microsoft.com/en-us/users/", "");

        var p = await axios.get(`${profilesBaseUrl}${userProfile}`).catch(() => {});
        if (p)
        {
            var userName = p.data.displayName;
            var userId = p.data.userId;
            var gameStatus = await axios.get(`${gameStatusBaseUrl}${userId}`).catch(() => {});

            var score = gameStatus.data.totalPoints;

            var returnObj = { "User": userName, "Score": score };
            
            results.push(returnObj);
        } 
    });
    await delay();

    Promise.all(results)
    .then(() => {
        results.sort((a, b) => a.Score > b.Score ? -1 : 1);
        console.log(results);
    });
}

getSiteData();