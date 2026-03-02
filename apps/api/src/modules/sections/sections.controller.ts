import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Section } from '@prisma/client';

import { CreateSectionDto } from './dto/create-section.dto';
import { ListSectionsDto } from './dto/list-sections.dto';
import { ReorderSectionDto } from './dto/reorder-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionsService } from './sections.service';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  create(@Body() dto: CreateSectionDto): Promise<Section> {
    return this.sectionsService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListSectionsDto): Promise<Section[]> {
    return this.sectionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Section> {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto): Promise<Section> {
    return this.sectionsService.update(id, dto);
  }

  @Post(':id/reorder')
  reorder(@Param('id') id: string, @Body() dto: ReorderSectionDto): Promise<Section[]> {
    return this.sectionsService.reorder(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.sectionsService.remove(id);
  }
}
