import { Console } from '../node_modules/as-wasi/assembly';
export class Base64 {
    static PADDING: string = "=";
    static ALPHAS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    private static bytes2group(raw: string, startIdx: i32): i32 {
        const b1 = raw.charCodeAt(startIdx + 0) << 16;
        const b2 = raw.charCodeAt(startIdx + 1) << 8;
        const b3 = raw.charCodeAt(startIdx + 2) << 0;
        return (b1 | b2 | b3);
    }

    private static process24bitsGroup(group: i32): Array<string> {
        const r1 = (group >> 18) & 0b111111;
        const r2 = (group >> 12) & 0b111111;
        const r3 = (group >> 6) & 0b111111;
        const r4 = (group >> 0) & 0b111111;
        return [
            this.ALPHAS.charAt(r1),
            this.ALPHAS.charAt(r2),
            this.ALPHAS.charAt(r3),
            this.ALPHAS.charAt(r4),
        ];
    }

    static encode(raw: string): string {
        const len = raw.length;
        if (len === 0) {
            return raw;
        }

        let rv: Array<string> = [];
        let i: i32;
        for (i=0; i<(len - len % 3); i+=3) {
            const group = this.bytes2group(raw, i);
            const rs = this.process24bitsGroup(group)
            rv.push(rs[0]);
            rv.push(rs[1]);
            rv.push(rs[2]);
            rv.push(rs[3]);
        }

        // handle remaining bytes
        const remaining = len % 3;
        if (remaining === 1) {
            const group = raw.charCodeAt(i) << 16;
            const rs = this.process24bitsGroup(group);
            rv.push(rs[0]);
            rv.push(rs[1]);
            rv.push(this.PADDING);
            rv.push(this.PADDING);
        } else if (remaining === 2) {
            const group = raw.charCodeAt(i) << 16 | raw.charCodeAt(i + 1) << 8;
            const rs = this.process24bitsGroup(group);
            rv.push(rs[0]);
            rv.push(rs[1]);
            rv.push(rs[2]);
            rv.push(this.PADDING);
        }
        return rv.join('');
    }

}
