import dotenv from 'dotenv';
dotenv.config();
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
const CLICK_UP_TOKEN = process.env.CLICK_UP_TOKEN;
const server = new McpServer({
    name: 'clickup',
    description: 'ClickUp | Model Context Protocol',
    version: '0.1.0',
    capabilities: {
        resources: {},
        tools: {},
    },
});
server.tool('list_spaces', 'Lista los espacios de mi equipo en ClickUp', { team_id: z.string().describe('Id del equipo') }, async ({ team_id }) => {
    try {
        const res = await fetch(`https://api.clickup.com/api/v2/team/${team_id}/space`, {
            headers: { Authorization: CLICK_UP_TOKEN },
        });
        const data = await res.json();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Ocurrió un error al obtener la lista de tareas: ${error}`,
                },
            ],
        };
    }
});
server.tool('list_folders', 'Obtiene las carpetas de un space dado', { space_id: z.string().describe('Id del espacio') }, async ({ space_id }) => {
    const res = await fetch(`https://api.clickup.com/api/v2/space/${space_id}/folder`, {
        headers: { Authorization: CLICK_UP_TOKEN },
    });
    const data = await res.json();
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
});
// 3. Listar listas de una carpeta
server.tool('list_lists', 'Obtiene las listas de una carpeta en ClickUp', { folder_id: z.string().describe('Id de la carpeta') }, async ({ folder_id }) => {
    const res = await fetch(`https://api.clickup.com/api/v2/folder/${folder_id}/list`, {
        headers: { Authorization: CLICK_UP_TOKEN },
    });
    const data = await res.json();
    return {
        content: [{ type: 'text', text: JSON.stringify(data.lists, null, 2) }],
    };
});
// 4. Listar tareas de una lista
server.tool('list_tasks', 'Lista las tareas de una lista dados su list_id', { list_id: z.string().describe('Id de la lista') }, async ({ list_id }) => {
    const res = await fetch(`https://api.clickup.com/api/v2/list/${list_id}/task?archived=false`, {
        headers: { Authorization: CLICK_UP_TOKEN },
    });
    const data = await res.json();
    const tasks = data.tasks.map((task) => ({
        id: task.id,
        custom_id: task.custom_id,
        name: task.name,
        status: task.status,
        creator: task.creator,
        assignees: task.assignees,
        watchers: task.watchers,
    }));
    return {
        content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }],
    };
});
// 5. Obtener detalle de una tarea
server.tool('get_task', 'Devuelve los detalles completos de una tarea', { task_id: z.string().describe('Id de la tarea') }, async ({ task_id }) => {
    const res = await fetch(`https://api.clickup.com/api/v2/task/${task_id}`, {
        headers: { Authorization: CLICK_UP_TOKEN },
    });
    const data = await res.json();
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
});
// 6. Crear una nueva tarea
server.tool('create_task', 'Crea una tarea en una lista', {
    list_id: z.string().describe('Id de la lista'),
    name: z.string().describe('Nombre de la tarea'),
    description: z.string().optional().describe('Descripción'),
}, async ({ list_id, name, description }) => {
    const res = await fetch(`https://api.clickup.com/api/v2/list/${list_id}/task`, {
        method: 'POST',
        headers: {
            Authorization: CLICK_UP_TOKEN,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
});
// 7. Actualizar estado de una tarea
server.tool('update_task_status', 'Cambia el estado (status) de una tarea', {
    task_id: z.string().describe('Id de la tarea'),
    status: z.string().describe('Nuevo estado'),
}, async ({ task_id, status }) => {
    const res = await fetch(`https://api.clickup.com/api/v2/task/${task_id}`, {
        method: 'PUT',
        headers: {
            Authorization: CLICK_UP_TOKEN,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
});
// 8. Añadir comentario a una tarea
server.tool('add_comment', 'Publica un comentario en una tarea', {
    task_id: z.string().describe('Id de la tarea'),
    comment_text: z.string().describe('Texto del comentario'),
}, async ({ task_id, comment_text }) => {
    const res = await fetch(`https://api.clickup.com/api/v2/task/${task_id}/comment`, {
        method: 'POST',
        headers: {
            Authorization: CLICK_UP_TOKEN,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_text }),
    });
    const data = await res.json();
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
});
const transport = new StdioServerTransport();
await server.connect(transport);
