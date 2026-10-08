package com.edumind.controller;

import com.edumind.dto.BookmarkDto;
import com.edumind.service.BookmarkService;
import com.edumind.service.StudentAccessService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookmarks")
@Validated
public class BookmarkController {
    private final BookmarkService bookmarks;
    private final StudentAccessService studentAccess;
    public BookmarkController(BookmarkService bookmarks, StudentAccessService studentAccess) {
        this.bookmarks = bookmarks;
        this.studentAccess = studentAccess;
    }

    @GetMapping("/{studentId}")
    public List<BookmarkDto> findByStudent(@PathVariable Long studentId, Authentication authentication) {
        studentAccess.requireAccess(studentId, authentication.getName());
        return bookmarks.findByStudent(studentId);
    }

    @PostMapping
    public BookmarkDto create(@Valid @RequestBody CreateBookmarkRequest request, Authentication authentication) {
        studentAccess.requireAccess(request.studentId(), authentication.getName());
        return bookmarks.create(request.studentId(), request.materialId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) { bookmarks.delete(id, authentication.getName()); }

    public record CreateBookmarkRequest(@NotNull Long studentId, @NotNull Long materialId) { }
}