import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Attachment } from '@prisma/client';

import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { ListAttachmentsDto } from './dto/list-attachments.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  create(@Body() dto: CreateAttachmentDto): Promise<Attachment> {
    return this.attachmentsService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListAttachmentsDto): Promise<Attachment[]> {
    return this.attachmentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Attachment> {
    return this.attachmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttachmentDto): Promise<Attachment> {
    return this.attachmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.attachmentsService.remove(id);
  }
}
