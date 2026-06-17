const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0ZjQ2N2RmMy05MWQ1LTQ1MzItYjg3Ni00MjgxYzA0ZmMwYTIiLCJlbWFpbCI6ImFtZWV0a3VtYXJ2dGFsd2FyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2ZWUwYmFkNDA5OGRiZjFmMmVjMiIsInNjb3BlZEtleVNlY3JldCI6ImE1MWRiZWE4MjIyMTlhN2MzMzhlZDlhM2M5YzA3MWU0YmYxOTZmNDJlMGMxMTc4ZTk4Y2Q2ZDhkMDllOWY3ZGIiLCJleHAiOjE4MTMwMDM5OTh9.jpp6Nv6hLwJXE79rx3UjNoQA2auvk6d2LeNg85teOlU";

app.post("/upload-url", async (req, res) => {
    try {
        const { imageUrl } = req.body;

        const imageResponse = await axios({
            url: imageUrl,
            method: "GET",
            responseType: "stream"
        });

        const formData = new FormData();
        formData.append("file", imageResponse.data);

        const pinataResponse = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                maxBodyLength: Infinity,
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${PINATA_JWT}`
                }
            }
        );

        const ipfsUrl =
            `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;

        res.json({ ipfsUrl });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});