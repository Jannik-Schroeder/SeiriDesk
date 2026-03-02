import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Folder } from '@prisma/client';

import { CreateFolderDto } from './dto/create-folder.dto';
import { ListFoldersDto } from './dto/list-folders.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FoldersService } from './folders.service';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Body() dto: CreateFolderDto): Promise<Folder> {
    return this.foldersService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListFoldersDto): Promise<Folder[]> {
    return this.foldersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Folder> {
    return this.foldersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFolderDto): Promise<Folder> {
    return this.foldersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.foldersService.remove(id);
  }
}
