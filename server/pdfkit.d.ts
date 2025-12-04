declare module 'pdfkit' {
  class PDFDocument {
    constructor(options?: {
      size?: string | [number, number];
      margin?: number;
      margins?: { top: number; left: number; bottom: number; right: number };
      layout?: 'portrait' | 'landscape';
      info?: {
        Title?: string;
        Author?: string;
        Subject?: string;
        Keywords?: string;
        CreationDate?: Date;
        ModDate?: Date;
      };
      autoFirstPage?: boolean;
      bufferPages?: boolean;
    });

    page: {
      width: number;
      height: number;
      margins: { top: number; left: number; bottom: number; right: number };
    };

    on(event: 'data', callback: (chunk: Buffer) => void): this;
    on(event: 'end', callback: () => void): this;
    on(event: 'error', callback: (error: Error) => void): this;

    rect(x: number, y: number, width: number, height: number): this;
    fill(color: string): this;
    stroke(color?: string): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;

    fontSize(size: number): this;
    font(font: string): this;
    text(text: string, x?: number, y?: number, options?: {
      width?: number;
      height?: number;
      align?: 'left' | 'center' | 'right' | 'justify';
      lineBreak?: boolean;
      ellipsis?: boolean | string;
      columns?: number;
      columnGap?: number;
      indent?: number;
      paragraphGap?: number;
      wordSpacing?: number;
      characterSpacing?: number;
      fill?: boolean;
      stroke?: boolean;
      link?: string;
      underline?: boolean;
      strike?: boolean;
      oblique?: boolean | number;
      continued?: boolean;
      features?: string[];
    }): this;

    moveDown(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;

    addPage(options?: object): this;
    switchToPage(pageNumber: number): this;
    bufferedPageRange(): { start: number; count: number };

    end(): void;
  }

  export = PDFDocument;
}
