// One embedded file of the static export. Bytes are kept base64-encoded in
// the binary and decoded on first use; `gzip` is "" when compressing did not
// pay off (images, fonts).
export class Asset {
    path: string;
    type: string;
    raw: string;
    gzip: string;
    etag: string;
    immutable: boolean;
    rawBytes: Buffer;
    gzipBytes: Buffer;
    decoded: boolean;

    constructor(path: string, type: string, raw: string, gzip: string, etag: string, immutable: boolean) {
        this.path = path;
        this.type = type;
        this.raw = raw;
        this.gzip = gzip;
        this.etag = etag;
        this.immutable = immutable;
        this.rawBytes = Buffer.alloc(0);
        this.gzipBytes = Buffer.alloc(0);
        this.decoded = false;
    }

    decode(): void {
        if (this.decoded) return;
        this.rawBytes = Buffer.from(this.raw, "base64");
        if (this.gzip !== "") this.gzipBytes = Buffer.from(this.gzip, "base64");
        this.decoded = true;
    }
}
