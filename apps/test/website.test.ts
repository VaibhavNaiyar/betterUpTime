import axios from "axios";
import { describe, it, expect, beforeAll } from "vitest";
import { createUser } from "./testUtils";
import { BACKEND_URL } from "./config";

describe("Website creation", () => {
    let token: string;

    beforeAll(async () => {
        const user = await createUser();
        token = user.jwt;
    });

    it("Should fail to create website if url is not provided", async () => {
        await expect(
            axios.post(
                `${BACKEND_URL}/website`,
                {},
                { headers: { Authorization: token } }
            )
        ).rejects.toThrow();
    });

    it("Should create website if url is provided", async () => {
        const res = await axios.post(
            `${BACKEND_URL}/website`,
            { url: "https://google.com" },
            { headers: { Authorization: token } }
        );
        expect(res.status).toBe(200);
        expect(res.data.id).toBeDefined();
    });

    it("Should fail to create website if no auth header is sent", async () => {
        await expect(
            axios.post(`${BACKEND_URL}/website`, { url: "https://google.com" })
        ).rejects.toThrow();
    });
});

describe("Website status", () => {
    let token1: string;
    let userId1: string;
    let token2: string;

    beforeAll(async () => {
        const user1 = await createUser();
        const user2 = await createUser();
        token1 = user1.jwt;
        userId1 = user1.id;
        token2 = user2.jwt;
    });

    it("Should fetch status of a website the user created", async () => {
        const createRes = await axios.post(
            `${BACKEND_URL}/website`,
            { url: "https://example.com" },
            { headers: { Authorization: token1 } }
        );

        const statusRes = await axios.get(
            `${BACKEND_URL}/website/status/${createRes.data.id}`,
            { headers: { Authorization: token1 } }
        );

        expect(statusRes.data.id).toBe(createRes.data.id);
        expect(statusRes.data.user_id).toBe(userId1);
    });

    it("Should not allow user2 to access user1's website", async () => {
        const createRes = await axios.post(
            `${BACKEND_URL}/website`,
            { url: "https://example.com" },
            { headers: { Authorization: token1 } }
        );

        await expect(
            axios.get(
                `${BACKEND_URL}/website/status/${createRes.data.id}`,
                { headers: { Authorization: token2 } }
            )
        ).rejects.toThrow();
    });
});
