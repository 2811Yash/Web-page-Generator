    const express = require("express");
    const fs = require("fs");
    const cors = require("cors");
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(express.static(__dirname));

    const API_KEY = "AIzaSyAGlwJMRzm77xDD-jZlzHAR5C6El5PfGb0";  // Replace with your actual API key
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Function to clean Gemini response
    function cleanHTML(htmlString) {
        const doctypeIndex = htmlString.indexOf("<!DOCTYPE html>");
        if (doctypeIndex !== -1) {
            htmlString = htmlString.slice(doctypeIndex);
        }
        return htmlString.trim().replace(/['`]+$/, "");
    }

    function cleanAfterBackticks(text) {
        return text.split("</html>")[0].trim();
    }

    // Route to handle user input and generate HTML
    app.post("/generate", async (req, res) => {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required." });
        }

        try {
            const result = await model.generateContent(`Generate an HTML + CSS webpage for add both in html page use style only a single HTML page : ${prompt}`);
            let responseText = await result.response.text();
            
            let cleanedHTML = cleanHTML(responseText);
            cleanedHTML = cleanAfterBackticks(cleanedHTML);

            // Save to demo2.html
            fs.writeFileSync("demo2.html", cleanedHTML);
            console.log("✅ Webpage generated successfully!");

            res.json({ success: true });
        } catch (error) {
            console.error("❌ Error generating content:", error);
            res.status(500).json({ success: false, message: "Error generating page." });
        }
    });

    // Route to send the generated HTML content
    app.get("/get-code", (req, res) => {
        fs.readFile("demo2.html", "utf8", (err, data) => {
            if (err) {
                return res.status(500).send("Error reading generated code.");
            }
            res.send(data);
        });
    });
 
    // Start the server
    const PORT = 3000;
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
