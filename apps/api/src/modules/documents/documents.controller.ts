import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Document } from '@prisma/client';

import { CreateDocumentDto } from './dto/create-document.dto';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() dto: CreateDocumentDto): Promise<Document> {
    return this.documentsService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListDocumentsDto): Promise<Document[]> {
    return this.documentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Document> {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto): Promise<Document> {
    return this.documentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentsService.remove(id);
  }
}
