import { describe, it, expect } from 'vitest';
import { convertDeveloper } from '../developer';

describe('Developer Converter', () => {
    it('converts JSON to YAML', async () => {
        const json = JSON.stringify({ key: 'value', arr: [1, 2, 3] });
        const yamlResult = await convertDeveloper(json, 'json', 'yaml');
        expect(yamlResult).toContain('key: value');
        expect(yamlResult).toContain('- 1');
    });

    it('converts YAML to JSON', async () => {
        const yamlStr = `key: value\narr:\n  - 1\n  - 2`;
        const jsonResult = await convertDeveloper(yamlStr, 'yaml', 'json');
        const parsed = JSON.parse(jsonResult);
        expect(parsed.key).toBe('value');
        expect(parsed.arr).toEqual([1, 2]);
    });

    it('converts JSON to CSV', async () => {
        const json = JSON.stringify([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
        const csvResult = await convertDeveloper(json, 'json', 'csv');
        expect(csvResult).toContain('a,b');
        expect(csvResult).toContain('1,2');
        expect(csvResult).toContain('3,4');
    });

    it('converts CSV to JSON', async () => {
        const csv = `a,b\n1,2\n3,4`;
        const jsonResult = await convertDeveloper(csv, 'csv', 'json');
        const parsed = JSON.parse(jsonResult);
        expect(parsed).toHaveLength(2);
        expect(parsed[0].a).toBe('1');
    });

    it('extracts Base64 to text', async () => {
        const b64 = Buffer.from('hello world').toString('base64');
        const txtResult = await convertDeveloper(b64, 'base64', 'txt');
        expect(txtResult).toContain('hello world');
    });
});
