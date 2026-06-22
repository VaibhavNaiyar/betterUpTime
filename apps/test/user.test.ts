import axios from "axios";
import { describe, it, expect } from "vitest";
import { BACKEND_URL } from "./config";

const USERNAME = Math.random().toString();

describe("Signup endpoints", () => {
    it("Should fail if body is missing username field", async () => {
        await expect(
            axios.post(`${BACKEND_URL}/user/signup`, {
                email: USERNAME,
                password: "password",
            })
        ).rejects.toThrow();
    });

    it("Should succeed with valid username and password", async () => {
        const res = await axios.post(`${BACKEND_URL}/user/signup`, {
            username: USERNAME,
            password: "password",
        });
        expect(res.status).toBe(200);
        expect(res.data.id).toBeDefined();
    });

    it("Should fail if user already exists", async () => {
        await expect(
            axios.post(`${BACKEND_URL}/user/signup`, {
                username: USERNAME,
                password: "password",
            })
        ).rejects.toThrow();
    });
});

describe("Signin endpoints", () => {
    it("Should fail if body is missing username field", async () => {
        await expect(
            axios.post(`${BACKEND_URL}/user/signin`, {
                email: USERNAME,
                password: "password",
            })
        ).rejects.toThrow();
    });

    it("Should fail with wrong password", async () => {
        await expect(
            axios.post(`${BACKEND_URL}/user/signin`, {
                username: USERNAME,
                password: "wrongpassword",
            })
        ).rejects.toThrow();
    });

    it("Should return a JWT on valid credentials", async () => {
        const res = await axios.post(`${BACKEND_URL}/user/signin`, {
            username: USERNAME,
            password: "password",
        });
        expect(res.status).toBe(200);
        expect(res.data.jwt).toBeDefined();
    });
});
