import { 
    DisputeReviewDto,
    ModuleProgressDto,
    PortfolioEntryDto,
    PreviewLinkDto,
    StudentPortfolioDto,
    StudentProfileDto, 
    StudentProgressDto, 
    SubmissionDto, 
    SubmissionHistoryDto, 
    TermProgressDto
} from "@/lib/api/types/student/types-dto";
import { 
    DisputeReview,
    ModuleProgress,
    PortfolioEntry,
    PreviewLink,
    StudentPortfolio,
    StudentProfile, 
    StudentProgress, 
    Submission, 
    SubmissionHistory, 
    TermProgress
} from "@/lib/api/types/student/types";
import { fromAiFormState, fromQuestionAnswer, toAiFormState, toQuestionAnswer } from "../submissions";

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
export function toPreviewLink(dto: PreviewLinkDto): PreviewLink {
    return {
        taskId: dto.task_id,
        url: dto.url,
        title: dto.title,
        type: dto.type,
        faviconUrl: dto.favicon_url
    }
}

export function fromPreviewLink(model: PreviewLink): PreviewLinkDto {
    return {
        task_id: model.taskId,
        url: model.url,
        title: model.title,
        favicon_url: model.faviconUrl
    }
}

export function toStudentProfile(dto: StudentProfileDto): StudentProfile {
    return {
        id: dto.id,
        fullName: dto.full_name,
        email: dto.email,
        classLevel: dto.class_level,
        classArm: dto.class_arm,
        schoolId: dto.school_id,
        schoolName: dto.school_name,
        roles: dto.roles,
        status: dto.status,
        googleId: dto.google_id,
        hasPinSet: dto.has_pin_set,
        createdAt: dto.created_at
    }
}

export function toModuleProgress(dto: ModuleProgressDto): ModuleProgress {
    return {
        moduleId: dto.module_id,
        title: dto.title,
        term: dto.term,
        weekNumber: dto.week_number,
        level: dto.level,
        completed: dto.completed,
        submissionStatus:dto.submission_status,
        submittedAt: dto.submitted_at
    }
}

export function toTermProgress(dto: TermProgressDto): TermProgress {
    return {
        term: dto.term,
        level: dto.level,
        totalModules: dto.total_modules,
        submittedModules: dto.submitted_modules,
        approvedModules: dto.approved_modules,
        flaggedModules: dto.flagged_modules,
        completionPercentage: dto.completion_percentage
    }
}

export function toStudentProgress(dto: StudentProgressDto): StudentProgress {
    return {
        currentTerm: dto.current_term,
        currentLevel: dto.current_level,
        termProgress: toTermProgress(dto.term_progress),
        modules: dto.modules.map(toModuleProgress)
    }
}

export function fromSubmission(model: Submission): SubmissionDto {
    return {
        id: model.id,
        module_id: model.moduleId,
        module_title: model.moduleTitle,
        term: model.term,
        week_number: model.weekNumber,
        ai_form: model.aiForm ? fromAiFormState(model.aiForm) : null,
        activity_text: model.activityText,
        reflection_text: model.reflectionText,
        file_urls: model.fileUrls?.map(fromPreviewLink) ?? null,
        other_urls: model.otherUrls?.map(fromPreviewLink) ?? null,
        question_answers: model.questionAnswers?.map(fromQuestionAnswer),
        status: model.status,
        teacher_note: model.teacherNote,
        submitted_at: model.submittedAt,
        synced_at: model.syncedAt,
        local_id: model.localId,
        dispute: model.dispute
    }
}

export function toSubmission(dto: SubmissionDto): Submission {
    return {
        id: dto.id,
        moduleId: dto.module_id,
        moduleTitle: dto.module_title,
        term: dto.term,
        weekNumber: dto.week_number,
        aiForm: dto.ai_form ? toAiFormState(dto.ai_form) : null,
        activityText: dto.activity_text,
        reflectionText: dto.reflection_text,
        fileUrls: dto.file_urls?.map(toPreviewLink)??null,
        otherUrls: dto.other_urls?.map(toPreviewLink)??null,
        questionAnswers: dto.question_answers?.map(toQuestionAnswer),
        status: dto.status,
        teacherNote: dto.teacher_note,
        submittedAt: dto.submitted_at,
        syncedAt: dto.synced_at,
        localId: dto.local_id,
        dispute: dto.dispute,
    }
}

export function toSubmissionHistory(dto: SubmissionHistoryDto): SubmissionHistory {
    return {
        submissions: dto.submissions.map(toSubmission),
        total: dto.total
    }
}

export function toPortfolioEntry(dto: PortfolioEntryDto): PortfolioEntry {
    return {
        id: dto.id,
        moduleId: dto.module_id,
        moduleTitle: dto.module_title,
        term: dto.term,
        weekNumber: dto.week_number,
        status: dto.status,
        reflectionText: dto.reflection_text,
        fileUrls: dto.file_urls?.map(toPreviewLink) ?? null,
        otherUrls: dto.other_urls?.map(toPreviewLink) ?? null,
        approvedAt: dto.approved_at,
        studentName: dto.student_name,
        schoolName: dto.school_name
    }
}

export function toStudentPortfolio(dto: StudentPortfolioDto): StudentPortfolio {
    return {
        entries: dto.entries.map(toPortfolioEntry),
        total: dto.total
    }
}


export function fromDisputeReview(model: DisputeReview): DisputeReviewDto {
    return {
        submission_id: model.submissionId,
        note: model.note,
        review: model.review
    }
}
