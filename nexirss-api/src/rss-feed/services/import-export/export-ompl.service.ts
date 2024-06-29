import * as xml from 'xml';

interface Outline {
  text: string;
  xmlUrl: string;
  type: string;
  category: string;
}

interface Header {
  title: string;
}

export class ExportOmplService {
  export(outlines: Outline[], header: Header): string {
    const headerXML = this.createHeader(header);
    const outlinesXML = this.createOutlines(outlines);

    const xmlString = `<?xml version="1.0" encoding="utf-8" standalone="no"?>
      <opml version="1.0">
        ${headerXML}
        <body>
          <outline text="feeds">
            ${outlinesXML}
          </outline>
        </body>
      </opml>`;

    return xmlString;
  }

  private createOutlines(outlines: Outline[]): string {
    return outlines.map((outline) => this.createOutline(outline)).join('');
  }

  private createOutline(outline: Outline): string {
    return xml({
      outline: {
        _attr: {
          text: outline.text,
          xmlUrl: outline.xmlUrl,
          type: outline.type,
          category: outline.category,
        },
      },
    });
  }

  private createHeader(header: Header): string {
    const headerObject = {
      head: {
        _attr: {
          title: header.title,
        },
      },
    };
    return xml(headerObject);
  }
}
