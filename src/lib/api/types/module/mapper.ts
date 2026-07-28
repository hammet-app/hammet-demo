import { 
    CurriculumModuleBlockType,
    CurriculumModuleBlock,
    ModulesResponse, 
    ModuleSummary, 
    CurriculumSection,
    CurriculumContentJson,
    CurriculumModule,
    SectionProgress,
} from "@/lib/api/types/module/types";
import { 
    CurriculumContentJsonDto,
    CurriculumModuleBlockDto, 
    CurriculumModuleDto, 
    CurriculumSectionDto,
    ModulesResponseDto, 
    ModuleSummaryDto, 
    SectionProgressDto
} from "@/lib/api/types/module/types-dto";

/**
 * Naming convention:
 *
 * fromXxx(...)
 * Converts frontend/domain models into backend DTOs
 * (camelCase -> snake_case, app shape -> API shape)
 *
 * toXxx(...)
 * Converts backend DTOs into frontend/domain models
 * (snake_case -> camelCase, API shape -> app shape)
 */

const block_type_map: Record<
  CurriculumModuleBlockType,
  CurriculumModuleBlockDto["type"]
> = {
  body: "body",
  subheading: "subheading",
  image: "image",
  activity: "activity",
  aiPrompt: "ai_prompt",
  reflection: "reflection",
  task: "task",
  videoEmbed: "video_embed",
  toolLink: "tool_link",
};

const blockTypeMap: Record<
  CurriculumModuleBlockDto["type"],
  CurriculumModuleBlockType
> = {
  body: "body",
  subheading: "subheading",
  image: "image",
  activity: "activity",
  ai_prompt: "aiPrompt",
  reflection: "reflection",
  task: "task",
  video_embed: "videoEmbed",
  tool_link: "toolLink",
};

export function toModuleSummary(dto: ModuleSummaryDto): ModuleSummary {
    return {
        id: dto.id,
        title: dto.title,
        term: dto.term,
        weekNumber: dto.week_number,
        level: dto.level,
        published: dto.published,
        submissionStatus: dto.submission_status
    }
}

export function toModuleResponse(dto: ModulesResponseDto): ModulesResponse {
    return {
        modules: dto.modules.map(toModuleSummary),
        total: dto.total
    }
}

export function toCurriculumModuleBlock(dto: CurriculumModuleBlockDto): CurriculumModuleBlock {
    return {
        id: dto.id,
        type: blockTypeMap[dto.type],
        content: dto.content,
        url: dto.url,
        toolName: dto.tool_name,
        required: dto.required,
        isValid: dto.is_valid,
    }
}

export function toCurriculumSection(dto: CurriculumSectionDto): CurriculumSection {
    return {
        id: dto.id,
        heading: dto.heading,
        blocks: dto.blocks.map(toCurriculumModuleBlock)
    }
}

export function toCurriculumContentJson(dto: CurriculumContentJsonDto): CurriculumContentJson {
    return {
        sections: dto.sections.map(toCurriculumSection)
    }
}

export function toCurriculumModule(dto: CurriculumModuleDto): CurriculumModule {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        outcome: dto.outcome,
        term: dto.term,
        weekNumber: dto.week_number,
        level: dto.level,
        contentJson: toCurriculumContentJson(dto.content_json),
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
        published: dto.published,
        stoppedAt: dto.stopped_at
    }
}

export function fromSectionProgress(model: SectionProgress): SectionProgressDto {
    return {
        student_id: model.studentId,
        module_id: model.moduleId,
        section_id: model.sectionId
    }
}

export function fromCurriculumModuleBlock(model: CurriculumModuleBlock): CurriculumModuleBlockDto {
    return {
        id: model.id,
        type: block_type_map[model.type],
        content: model.content,
        url: model.url,
        tool_name: model.toolName,
        required: model.required,
        is_valid: model.isValid,
    }
}

export function fromCurriculumSection(model: CurriculumSection): CurriculumSectionDto {
    return {
        id: model.id,
        heading: model.heading,
        blocks: model.blocks.map(fromCurriculumModuleBlock)
    }
}

export function fromCurriculumContentJson(model: CurriculumContentJson): CurriculumContentJsonDto {
    return {
        sections: model.sections.map(fromCurriculumSection)
    }
}

export function fromCurriculumModule(model: CurriculumModule): CurriculumModuleDto {
    return {
        id: model.id,
        title: model.title,
        description: model.description,
        outcome: model.outcome,
        term: model.term,
        tier:model.tier,
        week_number: model.weekNumber,
        level: model.level,
        content_json: fromCurriculumContentJson(model.contentJson),
        created_at: model.createdAt,
        updated_at: model.updatedAt,
        published: model.published,
        stopped_at: model.stoppedAt
    }
}