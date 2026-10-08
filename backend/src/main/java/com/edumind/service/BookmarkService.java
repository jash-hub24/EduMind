package com.edumind.service;

import com.edumind.dto.BookmarkDto;
import com.edumind.exception.DuplicateResourceException;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.Bookmark;
import com.edumind.repository.BookmarkRepository;
import com.edumind.repository.StudentRepository;
import com.edumind.repository.UserRepository;
import com.edumind.model.UserRole;
import org.springframework.security.access.AccessDeniedException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookmarkService {
    private final BookmarkRepository bookmarks;
    private final StudentRepository students;
    private final StudyMaterialService materials;
    private final UserRepository users;

    public BookmarkService(BookmarkRepository bookmarks, StudentRepository students, StudyMaterialService materials, UserRepository users) {
        this.bookmarks = bookmarks;
        this.students = students;
        this.materials = materials;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<BookmarkDto> findByStudent(Long studentId) {
        return bookmarks.findByStudentIdOrderByCreatedAtDesc(studentId).stream().map(this::toDto).toList();
    }

    public BookmarkDto create(Long studentId, Long materialId) {
        if (bookmarks.findByStudentIdAndMaterialId(studentId, materialId).isPresent()) {
            throw new DuplicateResourceException("This material is already bookmarked");
        }
        Bookmark bookmark = new Bookmark();
        bookmark.setStudent(students.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student", studentId)));
        bookmark.setMaterial(materials.findEntity(materialId));
        return toDto(bookmarks.save(bookmark));
    }

    public void delete(Long id, String email) {
        Bookmark bookmark = bookmarks.findById(id).orElseThrow(() -> new ResourceNotFoundException("Bookmark", id));
        var user = users.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User", email));
        Long ownStudentId = students.findByUserId(user.getId()).map(student -> student.getId()).orElse(null);
        if (user.getRole() != UserRole.FACULTY_ADMIN && !bookmark.getStudent().getId().equals(ownStudentId)) {
            throw new AccessDeniedException("You may only delete your own bookmarks");
        }
        bookmarks.delete(bookmark);
    }

    private BookmarkDto toDto(Bookmark bookmark) {
        var material = bookmark.getMaterial();
        return new BookmarkDto(bookmark.getId(), bookmark.getStudent().getId(), material.getId(),
                material.getTitle(), material.getResourceType(), material.getSubject().getName(), bookmark.getCreatedAt());
    }
}