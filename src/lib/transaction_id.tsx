// 参考：https://github.com/mikf/gallery-dl
// 辅助函数
function floatToHex(num: number): string {
  const numi = Math.floor(num);
  const fraction = num - numi;
  
  if (!fraction) {
    return numi.toString(16);
  }

  const result = ['.'];
  let frac = fraction;
  while (frac > 0.0) {
    frac *= 16.0;
    const integer = Math.floor(frac);
    frac -= integer;
    result.push(integer > 9 ? String.fromCharCode(integer + 87) : integer.toString());
  }
  return numi.toString(16) + result.join('');
}

function isOdd(num: number): number {
  return num % 2 ? -1.0 : 0.0;
}

function roundJs(num: number): number {
  const floor = Math.floor(num);
  return (num - floor) < 0.5 ? floor : Math.ceil(num);
}

function scale(value: number, valueMin: number, valueMax: number, rounding: boolean): number {
  const result = value * (valueMax - valueMin) / 255.0 + valueMin;
  return rounding ? Math.floor(result) : Number(result.toFixed(2));
}

function interpolateValue(x: number, a: number | boolean, b: number | boolean): number {
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return x <= 0.5 ? (a ? 1 : 0) : (b ? 1 : 0);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a * (1.0 - x) + b * x;
  }
  return 0;
}

function interpolateList(x: number, a: number[], b: number[]): number[] {
  return a.map((val, i) => interpolateValue(x, val, b[i]));
}

function rotationMatrix2d(deg: number): number[] {
  const rad = deg * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [cos, -sin, sin, cos];
}

function cubicCalculate(a: number, b: number, m: number): number {
  const m1 = 1.0 - m;
  return 3.0 * a * m1 * m1 * m + 3.0 * b * m1 * m * m + m * m * m;
}

function cubicValue(curve: number[], t: number): number {
  if (t <= 0.0) {
    if (curve[0] > 0.0) {
      const value = curve[1] / curve[0];
      return value * t;
    } else if (curve[1] === 0.0 && curve[2] > 0.0) {
      const value = curve[3] / curve[2];
      return value * t;
    }
    return 0.0;
  }

  if (t >= 1.0) {
    if (curve[2] < 1.0) {
      const value = (curve[3] - 1.0) / (curve[2] - 1.0);
      return 1.0 + value * (t - 1.0);
    } else if (curve[2] === 1.0 && curve[0] < 1.0) {
      const value = (curve[1] - 1.0) / (curve[0] - 1.0);
      return 1.0 + value * (t - 1.0);
    }
    return 0.0;
  }

  let start = 0.0;
  let end = 1.0;
  let mid = 0.0;
  
  while (start < end) {
    mid = (start + end) / 2.0;
    const est = cubicCalculate(curve[0], curve[2], mid);
    if (Math.abs(t - est) < 0.00001) {
      return cubicCalculate(curve[1], curve[3], mid);
    }
    if (est < t) {
      start = mid;
    } else {
      end = mid;
    }
  }
  return cubicCalculate(curve[1], curve[3], mid);
}

export class ClientTransaction {
  private keyBytes: Uint8Array;
  private animationKey: string;
  private isInitialized: boolean;

  constructor() {
    this.keyBytes = new Uint8Array(0);
    this.animationKey = '';
    this.isInitialized = false;
  }

  async initialize(homepage: string) {
    const key = this.extractVerificationKey(homepage);
    if (!key) {
      console.error("Failed to extract 'twitter-site-verification' key");
      return;
    }

    const ondemandS = this.extractBetween(homepage, '"ondemand.s":"', '"');
    const indices = await this.extractIndices(ondemandS);
    if (!indices) {
      console.error("Failed to extract KEY_BYTE indices");
      return;
    }

    const frames = this.extractFrames(homepage);
    if (!frames) {
      console.error("Failed to extract animation frame data");
      return;
    }

    this.keyBytes = this.base64ToBytes(key);
    this.animationKey = this.calculateAnimationKey(
      frames, indices[0], this.keyBytes, indices.slice(1)
    );
    this.isInitialized = true;
  }

  private extractVerificationKey(homepage: string): string {
    const pos = homepage.indexOf('name="twitter-site-verification"');
    const beg = homepage.lastIndexOf("<", pos);
    const end = homepage.indexOf(">", pos);
    return this.extractBetween(homepage.slice(beg, end), 'content="', '"');
  }

  private async extractIndices(ondemandS: string): Promise<number[]> {
    const url = `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${ondemandS}a.js`;
    const response = await fetch(url);
    const page = await response.text();
    const pattern = /\(\w\[(\d\d?)\],\s*16\)/g;
    const matches = [...page.matchAll(pattern)];
    return matches.map(m => parseInt(m[1]));
  }

  private extractFrames(homepage: string): string[] {
    const frames: string[] = [];
    let pos = 0;
    while (true) {
      const start = homepage.indexOf('id="loading-x-anim-', pos);
      if (start === -1) break;
      const end = homepage.indexOf('</svg>', start);
      if (end === -1) break;
      frames.push(homepage.slice(start, end));
      pos = end;
    }
    return frames;
  }

  private calculateAnimationKey(
    frames: string[],
    rowIndex: number,
    keyBytes: Uint8Array,
    keyBytesIndices: number[],
    totalTime: number = 4096
  ): string {
    const frame = frames[keyBytes[5] % 4];
    const array = this.generate2dArray(frame);
    const frameRow = array[keyBytes[rowIndex] % 16];

    let frameTime = 1;
    for (const index of keyBytesIndices) {
      frameTime *= keyBytes[index] % 16;
    }
    frameTime = roundJs(frameTime / 10) * 10;
    const targetTime = frameTime / totalTime;

    return this.animate(frameRow, targetTime);
  }

  private generate2dArray(frame: string): number[][] {
    const pathData = this.extractBetween(frame, '</path><path d="', '"');
    const paths = pathData.slice(9).split('C');
    return paths.map(path => 
      path.split(/[^\d]+/).filter(x => x).map(x => parseInt(x))
    );
  }

  private animate(frames: number[], targetTime: number): string {
    const curve = frames.slice(7).map((frame, index) => 
      scale(frame, isOdd(index), 1.0, false)
    );
    const cubic = cubicValue(curve, targetTime);

    const colorA = [frames[0], frames[1], frames[2]].map(Number);
    const colorB = [frames[3], frames[4], frames[5]].map(Number);
    const color = interpolateList(cubic, colorA, colorB).map(c => 
      c <= 0.0 ? 0.0 : c >= 255.0 ? 255.0 : c
    );

    const rotationA = 0.0;
    const rotationB = scale(frames[6], 60.0, 360.0, true);
    const rotation = interpolateValue(cubic, rotationA, rotationB);
    const matrix = rotationMatrix2d(rotation);

    const result = [
      Math.round(color[0]).toString(16),
      Math.round(color[1]).toString(16),
      Math.round(color[2]).toString(16),
      floatToHex(Math.abs(Math.round(matrix[0] * 100) / 100)),
      floatToHex(Math.abs(Math.round(matrix[1] * 100) / 100)),
      floatToHex(Math.abs(Math.round(matrix[2] * 100) / 100)),
      floatToHex(Math.abs(Math.round(matrix[3] * 100) / 100)),
      "00"
    ];

    return result.join('').replace(/\./g, '').replace(/-/g, '');
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private extractBetween(str: string, start: string, end: string): string {
    const startPos = str.indexOf(start);
    if (startPos === -1) return '';
    const startIndex = startPos + start.length;
    const endPos = str.indexOf(end, startIndex);
    if (endPos === -1) return '';
    return str.slice(startIndex, endPos);
  }

  generateTransactionId(
    method: string,
    path: string,
    keyword: string = "obfiowerehiring",
    rndnum: number = 3
  ): string {
    const now = Math.floor(Date.now() / 1000) - 1682924400;
    const bytesTime = new Uint8Array([
      now & 0xFF,
      (now >> 8) & 0xFF,
      (now >> 16) & 0xFF,
      (now >> 24) & 0xFF
    ]);

    const payload = `${method}!${path}!${now}${keyword}${this.animationKey}`;
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(payload);
    
    // 使用简单的哈希函数
    let hash = 0;
    for (let i = 0; i < payloadBytes.length; i++) {
      hash = ((hash << 5) - hash) + payloadBytes[i];
      hash = hash & hash;
    }
    
    const hashBytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      hashBytes[i] = (hash >> (i * 8)) & 0xFF;
    }

    const num = Math.floor(Math.random() * 256);
    const result = new Uint8Array([
      0,
      ...this.keyBytes,
      ...bytesTime,
      ...hashBytes,
      rndnum
    ]);

    for (let i = 0; i < result.length; i++) {
      result[i] = result[i] ^ num;
    }

    return btoa(String.fromCharCode.apply(null, Array.from(result)))
      .replace(/=+$/, '')
      .replace(/\n/g, '');
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// 创建全局实例
const clientTransaction = new ClientTransaction();

// 生成随机字符串的函数
function generateRandomString(length: number = 100): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 导出生成事务ID的函数
export function generateClientTransactionId(): string {
  if (!clientTransaction.isReady()) {
    // 如果没有初始化，使用默认值
    return generateRandomString(100);
  }
  return clientTransaction.generateTransactionId('POST', '/graphql');
}

// 导出初始化函数
export async function initializeTransactionId(homepage: string): Promise<void> {
  await clientTransaction.initialize(homepage);
}
