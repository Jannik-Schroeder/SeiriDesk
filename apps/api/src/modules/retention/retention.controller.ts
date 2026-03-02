import { Controller, Get, Query } from '@nestjs/common';

import { ReviewDueQueryDto } from './dto/review-due-query.dto';
import { RetentionService } from './retention.service';
import { ReviewDueResponse } from './retention.types';

@Controller('retention')
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Get('review-due')
  async getReviewDue(
    @Query() query: ReviewDueQueryDto,
  ): Promise<ReviewDueResponse> {
    const asOf = query.asOf ? new Date(query.asOf) : new Date();

    return this.retentionService.getReviewDueDocuments({
      householdId: query.householdId,
      asOf,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
