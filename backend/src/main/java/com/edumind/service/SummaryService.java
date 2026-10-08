package com.edumind.service;

import com.edumind.dto.SummaryDto;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.Summary;
import com.edumind.repository.SummaryRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SummaryService {
    private final SummaryRepository summaries;
    private final StudyMaterialService materials;

    public SummaryService(SummaryRepository summaries, StudyMaterialService materials) {
        this.summaries = summaries;
        this.materials = materials;
    }

    @Transactional(readOnly = true)
    public SummaryDto findByMaterial(Long materialId) {
        return summaries.findByMaterialId(materialId).map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Summary for material", materialId));
    }

    public SummaryDto save(SummaryDto request) {
        Summary summary = summaries.findByMaterialId(request.materialId()).orElseGet(Summary::new);
        summary.setMaterial(materials.findEntity(request.materialId()));
        summary.setOverview(request.overview());
        summary.setKeyPoints(request.keyPoints());
        summary.setUpdatedAt(Instant.now());
        return toDto(summaries.save(summary));
    }

    public SummaryDto generateDemo(Long materialId) {
        var material = materials.findEntity(materialId);
        String overview = material.getDescription() == null || material.getDescription().isBlank()
                ? material.getTitle() + " covers key concepts in " + material.getTopic() + "."
                : material.getDescription();
        return save(new SummaryDto(null, materialId, overview,
                List.of("Subject: " + material.getSubject().getName(), "Topic: " + material.getTopic(),
                        "Resource type: " + material.getResourceType()), null));
    }

    private SummaryDto toDto(Summary summary) {
        return new SummaryDto(summary.getId(), summary.getMaterial().getId(), summary.getOverview(),
                summary.getKeyPoints(), summary.getUpdatedAt());
    }
}