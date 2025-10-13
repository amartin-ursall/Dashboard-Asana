import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
// Type definitions for Asana API responses
interface AsanaTokenData {
    access_token: string;
    token_type: string;
    expires_in: number;
    data: {
        id: number;
        gid: string;
        name: string;
        email: string;
    };
    refresh_token: string;
}
interface AsanaUser {
    gid: string;
    email: string;
    name:string;
    photo?: {
        image_128x128: string;
    }
}
interface AsanaUserResponse {
    data: AsanaUser;
}
// Define Variables type for Hono context
export type Variables = {
    asana_token: string;
}
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env; Variables: Variables }>) {
    // Asana OAuth Routes
    app.get('/api/auth/asana', (c) => {
        const { VITE_ASANA_CLIENT_ID, VITE_ASANA_REDIRECT_URI } = c.env;
        const authUrl = `https://app.asana.com/-/oauth_authorize?client_id=${VITE_ASANA_CLIENT_ID}&redirect_uri=${VITE_ASANA_REDIRECT_URI}&response_type=code&state=`;
        return c.redirect(authUrl);
    });
    app.get('/api/auth/callback', async (c) => {
        const { VITE_ASANA_CLIENT_ID, VITE_ASANA_CLIENT_SECRET, VITE_ASANA_REDIRECT_URI } = c.env;
        const code = c.req.query('code');
        if (!code) {
            return c.json({ success: false, error: 'Authorization code is missing' }, { status: 400 });
        }
        try {
            // Use http for local dev proxy, https for production
            const isDev = c.req.url.includes('localhost');
            const tokenUrl = isDev ? 'http://app.asana.com/-/oauth_token' : 'https://app.asana.com/-/oauth_token';
            const tokenResponse = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: VITE_ASANA_CLIENT_ID,
                    client_secret: VITE_ASANA_CLIENT_SECRET,
                    redirect_uri: VITE_ASANA_REDIRECT_URI,
                    code: code,
                }),
            });
            if (!tokenResponse.ok) {
                const errorBody = await tokenResponse.text();
                console.error('Asana token exchange failed:', errorBody);
                throw new Error('Failed to exchange authorization code for token');
            }
            const tokenData = await tokenResponse.json<AsanaTokenData>();
            setCookie(c, 'asana_token', JSON.stringify(tokenData), {
                path: '/',
                secure: !isDev,
                httpOnly: true,
                sameSite: 'Lax',
                maxAge: tokenData.expires_in,
            });
            return c.json({ success: true });
        } catch (error) {
            console.error('OAuth callback error:', error);
            return c.json({ success: false, error: 'Internal server error during token exchange' }, { status: 500 });
        }
    });
    app.get('/api/auth/status', async (c) => {
        const tokenCookie = getCookie(c, 'asana_token');
        if (!tokenCookie) {
            return c.json({ success: true, data: { user: null } });
        }
        try {
            const { access_token } = JSON.parse(tokenCookie);
            const userResponse = await fetch('https://app.asana.com/api/1.0/users/me', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            if (!userResponse.ok) {
                deleteCookie(c, 'asana_token', { path: '/' });
                return c.json({ success: true, data: { user: null } });
            }
            const { data: user } = await userResponse.json<AsanaUserResponse>();
            const userProfile = {
                gid: user.gid,
                email: user.email,
                name: user.name,
                photo: user.photo?.image_128x128 || undefined,
            };
            return c.json({ success: true, data: { user: userProfile } });
        } catch (error) {
            console.error('Auth status error:', error);
            deleteCookie(c, 'asana_token', { path: '/' });
            return c.json({ success: true, data: { user: null } });
        }
    });
    app.post('/api/auth/logout', (c) => {
        deleteCookie(c, 'asana_token', { path: '/' });
        return c.json({ success: true });
    });
    // Asana API Proxy
    const asanaProxy = new Hono<{ Bindings: Env; Variables: Variables }>();
    asanaProxy.use('/*', async (c, next) => {
        const tokenCookie = getCookie(c, 'asana_token');
        if (!tokenCookie) {
            return c.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        try {
            const { access_token } = JSON.parse(tokenCookie);
            c.set('asana_token', access_token);
            await next();
        } catch (e) {
            return c.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }
    });
    const proxyRequest = async (c: any, url: string) => {
        const accessToken = c.get('asana_token');
        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Asana API Error:", errorText);
                return c.json({ success: false, error: 'Failed to fetch from Asana' }, { status: response.status });
            }
            const data = await response.json();
            return c.json({ success: true, data });
        } catch (error) {
            console.error("Proxy Error:", error);
            return c.json({ success: false, error: 'Internal server error' }, { status: 500 });
        }
    };
    asanaProxy.get('/workspaces', async (c) => {
        const url = `https://app.asana.com/api/1.0/workspaces`;
        return proxyRequest(c, url);
    });
    asanaProxy.get('/projects', async (c) => {
        const workspace = c.req.query('workspace_gid');
        if (!workspace) {
            return c.json({ success: false, error: 'Workspace GID is required' }, { status: 400 });
        }
        const opt_fields = "name,permalink_url,color,owner,current_status,due_on";
        const url = `https://app.asana.com/api/1.0/projects?workspace=${workspace}&opt_fields=${opt_fields}`;
        return proxyRequest(c, url);
    });
    asanaProxy.get('/projects/:projectId', async (c) => {
        const projectId = c.req.param('projectId');
        const opt_fields = "name,notes,permalink_url,color,owner,current_status,due_on,created_at,modified_at,workspace.name";
        const url = `https://app.asana.com/api/1.0/projects/${projectId}?opt_fields=${opt_fields}`;
        return proxyRequest(c, url);
    });
    asanaProxy.get('/projects/:projectId/tasks', async (c) => {
        const projectId = c.req.param('projectId');
        const opt_fields = "name,assignee.name,assignee.photo,due_on,completed,permalink_url";
        const url = `https://app.asana.com/api/1.0/projects/${projectId}/tasks?opt_fields=${opt_fields}`;
        return proxyRequest(c, url);
    });
    asanaProxy.get('/tasks', async (c) => {
        const user = c.req.query('user_gid') || 'me';
        const workspace = c.req.query('workspace_gid');
        const limit = c.req.query('limit') || '100';
        const opt_fields = "name,assignee.name,assignee.photo,due_on,completed,projects.name,permalink_url";
        if (!workspace) {
            return c.json({ success: false, error: 'Workspace GID is required' }, { status: 400 });
        }
        const url = `https://app.asana.com/api/1.0/tasks?assignee=${user}&workspace=${workspace}&limit=${limit}&opt_fields=${opt_fields}`;
        return proxyRequest(c, url);
    });
    app.route('/api/asana', asanaProxy);
    // Session Management Routes (from template)
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({ success: false, error: 'Failed to retrieve sessions' }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title || `Chat ${new Date().toLocaleString()}`;
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
        }
    });
}