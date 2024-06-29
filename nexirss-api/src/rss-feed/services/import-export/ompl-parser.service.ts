import { parseString, ElementCompact } from 'xml2js';
import { Injectable } from '@nestjs/common';

export interface OmplFeed {
  text: string;
  xmlUrl: string;
  type: string;
  category: string;
}

@Injectable()
export class OmplParser {
  async parse(xmlString: string): Promise<OmplFeed[]> {
    const feeds: OmplFeed[] = [];

    try {
      const result = await this.parseXml(xmlString);
      if (result.opml && result.opml.body && result.opml.body.outline) {
        const outlines = result.opml.body.outline.outline;

        if (Array.isArray(outlines)) {
          outlines.forEach((outline: ElementCompact) => {
            feeds.push({
              text: outline.$.text,
              xmlUrl: outline.$.xmlUrl,
              type: outline.$.type,
              category: outline.$.category || undefined, // Use undefined if category attribute is not provided
            });
          });
        } else if (outlines && outlines.$) {
          // Handle single outline case
          feeds.push({
            text: outlines.$.text,
            xmlUrl: outlines.$.xmlUrl,
            type: outlines.$.type,
            category: outlines.$.category || undefined, // Use undefined if category attribute is not provided
          });
        }
      }
    } catch (error) {
      console.error('Error parsing OPML:', error);
    }

    return feeds;
  }

  private parseXml(xmlString: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xmlString, { explicitArray: false }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}
