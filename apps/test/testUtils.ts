import axios from "axios";
import { BACKEND_URL } from "./config";

export async function createUser(): Promise<{ id: string; jwt: string }> {
    const username = Math.random().toString();

    const signupRes = await axios.post(`${BACKEND_URL}/user/signup`, {
        username,
        password: "123123123",
    });

    const signinRes = await axios.post(`${BACKEND_URL}/user/signin`, {
        username,
        password: "123123123",
    });

    return {
        id: signupRes.data.id,
        jwt: signinRes.data.jwt,
    };
}
