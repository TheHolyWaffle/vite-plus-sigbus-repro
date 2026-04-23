import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

function walk(dir: string, budget: { left: number }): void {
    if (budget.left <= 0) return;
    let entries: string[];
    try { entries = readdirSync(dir); } catch { return; }
    for (const name of entries) {
        if (budget.left <= 0) return;
        const full = join(dir, name);
        let st: ReturnType<typeof statSync>;
        try { st = statSync(full); } catch { continue; }
        budget.left -= 1;
        if (st.isDirectory()) walk(full, budget);
        else if (st.isFile() && st.size < 16_384) {
            try { readFileSync(full); } catch { /* ignore */ }
        }
    }
}

describe('heavy I/O', () => {
    it('exhausts fspy shared-memory region via prolonged filesystem access', () => {
        for (let round = 0; round < 100; round++) {
            const budget = { left: 500_000 };
            walk('/work/node_modules', budget);
            walk('/usr/lib', budget);
            walk('/usr/share', budget);
            try { execSync('find /usr/lib /usr/share /work/node_modules -type f 2>/dev/null | xargs -r stat -c "%n" > /dev/null', { stdio: 'ignore' }); } catch { /* ignore */ }
        }
        expect(true).toBe(true);
    }, 1_800_000);
});
