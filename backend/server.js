const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large copy-pastes

// Multer setup for file uploads (in-memory storage for security/speed)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Regex Patterns for Sensitive Data
const PATTERNS = {
    aws_access_key: {
        regex: /(?<![A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])/g,
        name: "AWS Access Key ID"
    },
    aws_secret_key: {
        regex: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g,
        name: "AWS Secret Access Key"
    },
    google_api_key: {
        regex: /AIza[0-9A-Za-z-_]{35}/g,
        name: "Google API Key"
    },
    generic_api_key: {
        regex: /(?:api_key|apikey|access_token|auth_token|secret_key|client_secret)(?:\s*[:=]\s*['"])([\w-]{16,})(?:['"])/gi,
        name: "Generic API Key / Token"
    },
    url: {
        regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
        name: "URL",
        validate: (value) => {
            // Filter out incomplete URLs like "https://www." or "http://www"
            if (value.endsWith('.') || value.endsWith('www')) return false;
            // Ensure there's a dot for the TLD and at least 2 chars after the last dot
            const parts = value.split('.');
            if (parts.length < 2) return false;
            const tld = parts[parts.length - 1];
            if (tld.length < 2) return false;
            return true;
        }
    },
    suspicious_string: {
        regex: /(?<=['"])[a-zA-Z0-9_.-]*(?:secret|password|token|key)[a-zA-Z0-9_.-]*(?=['"])/gi,
        name: "Suspicious String Value",
        validate: (value) => {
            // Filter out common false positives or UI text (though regex excludes spaces already)
            if (value.length < 8) return false; // Too short?
            const lower = value.toLowerCase();
            if (lower === 'password' || lower === 'secret') return false; // Generic words
            return true;
        }
    },
    email: {
        regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        name: "Email Address"
    },
    ip_address: {
        regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        name: "IP Address",
        validate: (value) => {
            const parts = value.split('.');
            return parts.every(part => {
                const num = parseInt(part, 10);
                return num >= 0 && num <= 255;
            });
        }
    },
    local_path: {
        regex: /(?:[A-Za-z]:\\(?:[^\\:*?"<>|\r\n]+\\)*[^\\:*?"<>|\r\n]*)|(?:\/(?:[^/\0]+\/)*[^/\0]+)/g,
        name: "File Path (Potential)"
    },
    username: {
        regex: /(?:username|user|login)(?:\s*[:=]\s*['"])([\w-@.]{3,})(?:['"])/gi,
        name: "Potential Username"
    },
    password: {
        regex: /(?:password|passwd|pwd|secret)(?:\s*[:=]\s*['"])([\w-@.!#$%^&*]{6,})(?:['"])/gi,
        name: "Potential Password"
    }
};

/**
 * Analyzes text content against defined regex patterns.
 * @param {string} content - The text content to analyze.
 * @returns {Array} - Array of found items with type, value, and location (stubbed).
 */
function analyzeContent(content) {
    const results = [];

    for (const [key, patternData] of Object.entries(PATTERNS)) {
        const regex = new RegExp(patternData.regex); // Create new instance to avoid state issues
        const matches = [...content.matchAll(regex)];

        matches.forEach(m => {
            const value = m[1] || m[0]; // Capture group 1 if exists, else full match

            // Basic filtering to reduce noise
            if (value.length < 4) return;
            if (key === 'local_path' && (value.includes('\n') || value.length > 200)) return;

            // Custom Validation
            if (patternData.validate && !patternData.validate(value)) {
                return;
            }

            // Find line number
            const index = m.index;
            const lineNum = content.substring(0, index).split('\n').length;

            results.push({
                type: patternData.name,
                key: key,
                value: value,
                line: lineNum
            });
        });
    }
    return results;
}

// Endpoint: Analyze Text
app.post('/api/analyze-text', (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        const results = analyzeContent(text);
        res.json({ success: true, results });
    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint: Analyze File
app.post('/api/analyze-file', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const content = req.file.buffer.toString('utf-8');
        const results = analyzeContent(content);

        res.json({
            success: true,
            fileName: req.file.originalname,
            results
        });
    } catch (error) {
        console.error("File Analysis Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`JS Extractor Backend running at http://localhost:${port}`);
});
