import Papa from 'papaparse';
import * as yaml from 'yaml';

// Simple XML to JSON parser (best effort)
function xmlToJson(xml: string) {
    // A naive regex-based parser is error prone, so let's rely on standard DOM format if in browser
    if (typeof window !== 'undefined' && window.DOMParser) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");

        // Very basic DOM to Object translation
        const nodeToObject = (node: Node): any => {
            const obj: any = {};
            if (node.nodeType === 1) { // element
                const attrs = (node as any).attributes;
                if (attrs && attrs.length > 0) {
                    obj["@attributes"] = {};
                    for (let j = 0; j < attrs.length; j++) {
                        const attribute = attrs.item(j);
                        if (attribute) obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                    }
                }
            } else if (node.nodeType === 3) { // text
                return node.nodeValue?.trim();
            }

            if (node.hasChildNodes()) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const item = node.childNodes.item(i);
                    const nodeName = item.nodeName;
                    if (typeof obj[nodeName] === "undefined") {
                        const result = nodeToObject(item);
                        if (result !== "" && result !== undefined) obj[nodeName] = result;
                    } else {
                        if (typeof obj[nodeName].push === "undefined") {
                            const old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        const result = nodeToObject(item);
                        if (result !== "" && result !== undefined) obj[nodeName].push(result);
                    }
                }
            }
            return obj;
        };
        return nodeToObject(doc.documentElement);
    }
    return { error: 'DOM Parser not available' };
}

// Simple JSON to XML
function jsonToXml(obj: any, rootName = 'root'): string {
    let xml = '';
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (Array.isArray(obj[prop])) {
                for (const item of obj[prop]) {
                    xml += `<${prop}>${typeof item === 'object' ? jsonToXml(item) : item}</${prop}>\n`;
                }
            } else if (typeof obj[prop] === 'object') {
                xml += `<${prop}>\n${jsonToXml(obj[prop])}</${prop}>\n`;
            } else {
                xml += `<${prop}>${obj[prop]}</${prop}>\n`;
            }
        }
    }
    return rootName ? `<${rootName}>\n${xml}</${rootName}>` : xml;
}

export async function convertDeveloper(fileContent: string, fromExt: string, toExt: string): Promise<string> {
    let jsObj: any = null;

    // 1. Parse into JS object
    try {
        switch (fromExt) {
            case 'json':
                jsObj = JSON.parse(fileContent);
                break;
            case 'yaml':
            case 'yml':
                jsObj = yaml.parse(fileContent);
                break;
            case 'csv':
                const csvResults = Papa.parse(fileContent, { header: true });
                jsObj = csvResults.data;
                break;
            case 'xml':
                jsObj = xmlToJson(fileContent);
                break;
            case 'base64':
            case 'txt':
            case 'md':
            case 'sql':
                // For text formats, we can just treat them as strings if targeting other text formats
                if (toExt === 'txt' && fromExt !== 'base64') return fileContent; // Passthrough
                if (fromExt === 'base64') {
                    jsObj = { data: typeof window !== 'undefined' ? atob(fileContent) : Buffer.from(fileContent, 'base64').toString('utf-8') };
                } else {
                    jsObj = { text: fileContent };
                }
                break;
            default:
                throw new Error(`Unsupported input format: ${fromExt}`);
        }
    } catch (error) {
        throw new Error(`Failed to parse ${fromExt} file.`);
    }

    // 2. Stringify from JS object to target format
    try {
        switch (toExt) {
            case 'json':
                return JSON.stringify(jsObj, null, 2);
            case 'yaml':
            case 'yml':
                return yaml.stringify(jsObj);
            case 'csv':
                if (Array.isArray(jsObj)) {
                    return Papa.unparse(jsObj);
                } else if (typeof jsObj === 'object') {
                    return Papa.unparse([jsObj]); // wrap object in array
                }
                throw new Error('Data is not convertible to CSV');
            case 'xml':
                return jsonToXml(jsObj);
            case 'txt':
                return typeof jsObj === 'string' ? jsObj : JSON.stringify(jsObj, null, 2);
            case 'sql':
                // Extremely naive json array to SQL insert
                if (Array.isArray(jsObj) && jsObj.length > 0) {
                    const keys = Object.keys(jsObj[0]);
                    let sql = `CREATE TABLE data_table (${keys.map(k => `${k} TEXT`).join(', ')});\n`;
                    for (const row of jsObj) {
                        const values = keys.map(k => `'${String(row[k]).replace(/'/g, "''")}'`);
                        sql += `INSERT INTO data_table (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
                    }
                    return sql;
                }
                return '-- Could not generate SQL from non-array data';
            default:
                throw new Error(`Unsupported output format: ${toExt}`);
        }
    } catch (error: any) {
        throw new Error(`Failed to convert to ${toExt}: ${error.message}`);
    }
}
