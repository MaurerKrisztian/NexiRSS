import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ExportFeedService } from '../services/import-export/export-feed.service';
import { ImportFeedService } from '../services/import-export/import-feed.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { User } from '../../user/models/user.schema';
import { AuthUser } from '../../auth/decorators/user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ImportExportController {
  constructor(
    private readonly exportFeedService: ExportFeedService,
    private readonly importFeedService: ImportFeedService,
  ) {}

  @Get('export')
  async exportOmpl(@AuthUser() user: User) {
    return this.exportFeedService.exporOmpl(user.feeds);
  }
  @Post('import')
  async importOmpl(@Body() body: { xml: string }, @AuthUser() user: User) {
    console.log(body.xml);
    return this.importFeedService.import(body.xml, user._id);
  }
}
