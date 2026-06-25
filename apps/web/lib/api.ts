const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api/v1";

export interface Tick {
  id: string;
  status: "Up" | "Down" | "Unkown";
  response_time: number;
  createdAt: string;
}

export interface Website {
  id: string;
  url: string;
  ticks: Tick[];
}

export interface WebsitesResponse {
  websites: Website[];
}

export interface SignInResponse {
  token: string;
}

export interface AddWebsiteResponse {
  id: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(optHeaders ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || "Something went wrong. Please try again.");
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(text || "Something went wrong. Please try again.");
      }
      throw e;
    }
  }

  // DELETE returns 200/204 with no body sometimes
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return {} as T;
}

export async function signup(username: string, password: string): Promise<void> {
  await request("/user/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function signin(
  username: string,
  password: string
): Promise<string> {
  const data = await request<SignInResponse>("/user/signin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return data.token;
}

export async function getWebsites(token: string): Promise<Website[]> {
  const data = await request<WebsitesResponse>("/website/all", {
    headers: { Authorization: token },
  });
  return data.websites;
}

export async function addWebsite(
  token: string,
  url: string
): Promise<AddWebsiteResponse> {
  return request<AddWebsiteResponse>("/website", {
    method: "POST",
    headers: { Authorization: token },
    body: JSON.stringify({ url }),
  });
}

export async function deleteWebsite(
  token: string,
  id: string
): Promise<void> {
  await request(`/website/${id}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
}
