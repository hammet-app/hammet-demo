import { 
    CurriculumModuleBlockType,
    CurriculumModuleBlock,
    ModulesResponse, 
    ModuleSummary, 
    CurriculumSection,
    CurriculumContentJson,
    CurriculumModule,
    SectionProgress
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