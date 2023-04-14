// const fs = require("fs");
// const axios = require("axios");
// const { google, testing_v1 } = require("googleapis");
// const { co2 } = require("@tgwf/co2");
// const https = require("https");
// const todaysDate = require("./date.js");
// const Enviro = require("./enviro");

// Import modules
import * as dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import { google, testing_v1 } from "googleapis";
import { co2 } from "@tgwf/co2";
import https from "https";
import { currentDate } from "./date.js";
import Enviro from "./enviro.js";

// Get environment variables
dotenv.config();

// Global Variables
const psiKey = process.env.PSI_API_KEY;

const urls = [
    "https://www.esteelauder.co.uk/",
    "https://www.aesop.com/uk/",
    "https://www.clinique.co.uk/",
    "https://www.maccosmetics.co.uk/",
    "https://www.loreal.com/en/",
    "https://www.thebodyshop.com/en-gb/",
    "https://www.clarins.co.uk/",
    "https://www.shiseido.co.uk/gb/en/",
    "https://www.fresh.com/uk/home",
    "https://www.kiehls.co.uk/",
    "https://www.riverford.co.uk/",
];

// Use PSI Api to collect data for gsheets
async function gatherPerformanceData(url) {
    const psi =
        await `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${psiKey}`;
    const serverCheck = await serverReview(url);

    // Ternary operator
    const server = serverCheck === "Green" ? true : false
    console.log(server);

    try {
        const response = await axios.get(psi)
        const { categories, audits } = response.data.lighthouseResult;
        const pageWeight =
                audits["resource-summary"].details.items[0].transferSize;
    } catch (error) {
        console.error(error)
        return error
    }

    return axios
        .get(psi)
        .then(async (response) => {
            const { categories, audits } = response.data.lighthouseResult;
            const pageWeight =
                audits["resource-summary"].details.items[0].transferSize;
            console.log(pageWeight);
            const enviro = new Enviro();
            const greenGas = await enviro
                .enviroImpact(pageWeight, server)
                .then((result) => {
                    return result;
                });
            console.log(greenGas);
            const psiData = {
                todaysDate: currentDate(),
                URL: response.data.id,
                PScore: Math.ceil(categories["performance"].score * 100),
                CachedWeight:
                    audits["resource-summary"].details.items[0].transferSize /
                    1000000,
                UncachedWeight:
                    audits["resource-summary"].details.items[0].transferSize /
                    1000000,
                FCP: audits["first-contentful-paint"].numericValue / 1000,
                LCP: audits["largest-contentful-paint"].numericValue / 1000,
                SpeedIndex: audits["speed-index"].numericValue / 1000,
                TTI: audits["interactive"].numericValue / 1000,
                CLS: audits["cumulative-layout-shift"].displayValue,
                Usage: greenGas,
                GreenSever: serverCheck,
            };
            return psiData;
        })
        .catch((error) => {
            console.log(error);
        });
}

// Push data to a promise
const testURLList = Promise.all(
    urls.map((url) => {
        return gatherPerformanceData(url);
    }),
);

//Loop Through Promise
testURLList
    .then(async (tests) => {
        console.log("Pushing Data to sheets...");
        //Setting up GSC Account for Gsheets
        const auth = new google.auth.GoogleAuth({
            keyFile: "./credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });
        const client = await auth.getClient(); // Creat client instance for auth
        const googleSheets = google.sheets({ version: "v4", auth: client }); // Instance of google sheets API
        const spreadSheetID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID; // ID of google sheets i want to access
        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId: spreadSheetID,
            range: "Sheet1!A:B",
        }); // Get metadata about spreadsheet
        for (let i = 0; i < tests.length; i++) {
            googleSheets.spreadsheets.values.append({
                auth,
                spreadsheetId: spreadSheetID,
                range: "Sheet1!A:B",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [
                        [
                            tests[i].todaysDate,
                            tests[i].URL,
                            tests[i].PScore,
                            tests[i].CachedWeight,
                            tests[i].UncachedWeight,
                            tests[i].FCP,
                            tests[i].LCP,
                            tests[i].SpeedIndex,
                            tests[i].TTI,
                            tests[i].CLS,
                            tests[i].Usage,
                            tests[i].test,
                        ],
                    ],
                },
            });
        }
    })
    .catch((error) => {
        console.log(error);
    });

async function serverReview(url) {
    console.log(url);
    const serverImpact = new Enviro();
    try {
        const result = await serverImpact.sustainServer(url);
        console.log(result);
    } catch (error) {
        console.error(console.error);
    }
}

export default gatherPerformanceData;
