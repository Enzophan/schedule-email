const fetch = require('node-fetch');

/**
 * Fetches tasks from a Notion database.
 * @param {string} apiKey Notion Integration Token
 * @param {string} databaseId Notion Database ID
 * @returns {Promise<Array<{title: string, url: string, status: string, properties: Object}>>}
 */
async function fetchNotionTasks(apiKey, databaseId) {
    if (!apiKey || !databaseId) {
        throw new Error("Missing Notion configuration. Please define NOTION_API_KEY and NOTION_DATABASE_ID in your .env file.");
    }

    const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Notion API request failed with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (!data.results) {
        return [];
    }

    return data.results.map(page => {
        const properties = page.properties || {};
        
        // 1. Find Title property dynamically (Notion database pages always have exactly one title property)
        let title = 'Untitled';
        const titleProp = Object.values(properties).find(prop => prop.type === 'title');
        if (titleProp && titleProp.title && titleProp.title.length > 0) {
            title = titleProp.title.map(t => t.plain_text).join('');
        }

        // 2. Find Status/Completion status dynamically
        // We look for checkbox, status, or select fields
        let status = 'No Status';
        
        // Check for checkbox properties (e.g. Done, Completed)
        const checkboxProp = Object.entries(properties).find(([_, prop]) => prop.type === 'checkbox');
        if (checkboxProp) {
            status = checkboxProp[1].checkbox ? 'Completed' : 'To Do';
        } else {
            // Check for status property
            const statusProp = Object.values(properties).find(prop => prop.type === 'status');
            if (statusProp && statusProp.status) {
                status = statusProp.status.name;
            } else {
                // Check for select property (e.g. Status as a single select)
                const selectProp = Object.values(properties).find(prop => prop.type === 'select');
                if (selectProp && selectProp.select) {
                    status = selectProp.select.name;
                }
            }
        }

        return {
            title: title || 'Untitled',
            url: page.url || '',
            status: status,
            lastEditedTime: page.last_edited_time
        };
    });
}

module.exports = {
    fetchNotionTasks
};
