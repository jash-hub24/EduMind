package com.edumind.config;

import com.edumind.model.FacultyAdmin;
import com.edumind.model.Flashcard;
import com.edumind.model.Question;
import com.edumind.model.Quiz;
import com.edumind.model.Student;
import com.edumind.model.StudyMaterial;
import com.edumind.model.Subject;
import com.edumind.model.User;
import com.edumind.model.UserRole;
import com.edumind.repository.FacultyAdminRepository;
import com.edumind.repository.FlashcardRepository;
import com.edumind.repository.QuizRepository;
import com.edumind.repository.StudentRepository;
import com.edumind.repository.StudyMaterialRepository;
import com.edumind.repository.SubjectRepository;
import com.edumind.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoDataSeeder implements ApplicationRunner {
    private final UserRepository users;
    private final StudentRepository students;
    private final FacultyAdminRepository facultyAdmins;
    private final SubjectRepository subjects;
    private final StudyMaterialRepository materials;
    private final QuizRepository quizzes;
    private final FlashcardRepository flashcards;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository users, StudentRepository students, FacultyAdminRepository facultyAdmins,
                          SubjectRepository subjects, StudyMaterialRepository materials, QuizRepository quizzes,
                          FlashcardRepository flashcards, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.students = students;
        this.facultyAdmins = facultyAdmins;
        this.subjects = subjects;
        this.materials = materials;
        this.quizzes = quizzes;
        this.flashcards = flashcards;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() > 0) return;

        User studentUser = createUser("Maya Chen", "student@edumind.com", "student1234", UserRole.STUDENT);
        Student student = new Student();
        student.setUser(studentUser);
        students.save(student);

        User adminUser = createUser("EduMind Faculty", "admin@edumind.com", "admin1234", UserRole.FACULTY_ADMIN);
        FacultyAdmin admin = new FacultyAdmin();
        admin.setUser(adminUser);
        facultyAdmins.save(admin);

        List<Subject> catalog = new ArrayList<>();
        String[][] subjectInfo = {
                {"DBMS", "Relational databases, transactions, normalization, and query design."},
                {"Data Structures", "Core structures for organizing and accessing data efficiently."},
                {"Algorithms", "Analysis and design of algorithms for common computing problems."},
                {"Java", "Object-oriented programming, the JVM, collections, and language fundamentals."},
                {"Operating Systems", "Processes, memory, scheduling, synchronization, and file systems."},
                {"Computer Networks", "Network protocols, addressing, routing, and application services."}
        };
        for (String[] item : subjectInfo) {
            Subject subject = new Subject();
            subject.setName(item[0]);
            subject.setDescription(item[1]);
            catalog.add(subjects.save(subject));
        }

        seedMaterials(catalog, adminUser);
        seedQuizzes(catalog, adminUser);
        seedFlashcards(catalog);
    }

    private User createUser(String fullName, String email, String password, UserRole role) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        return users.save(user);
    }

    private void seedMaterials(List<Subject> catalog, User admin) {
        String[][] data = {
                {"Relational Model and Keys", "DBMS", "Relational Model", "NOTES"},
                {"Normalization: 1NF to BCNF", "DBMS", "Normalization", "PDF"},
                {"SQL Joins Practice Set", "DBMS", "SQL Joins", "QUESTION_BANK"},
                {"Arrays, Lists, and Complexity", "Data Structures", "Arrays", "NOTES"},
                {"Trees and Binary Search Trees", "Data Structures", "Trees", "PDF"},
                {"Stacks and Queues Workbook", "Data Structures", "Stacks and Queues", "QUESTION_BANK"},
                {"Sorting Algorithms Compared", "Algorithms", "Sorting", "VIDEO"},
                {"Graph Search: BFS and DFS", "Algorithms", "Graph Traversal", "NOTES"},
                {"Dynamic Programming Patterns", "Algorithms", "Dynamic Programming", "PDF"},
                {"Java Classes and Interfaces", "Java", "Object-Oriented Design", "NOTES"},
                {"Collections Framework Guide", "Java", "Collections", "PDF"},
                {"Java Programming Examination 2025", "Java", "Core Java", "PYQ"},
                {"Process Scheduling Notes", "Operating Systems", "Scheduling", "NOTES"},
                {"Virtual Memory and Paging", "Operating Systems", "Memory Management", "PDF"},
                {"Synchronization Problems", "Operating Systems", "Synchronization", "QUESTION_BANK"},
                {"TCP/IP Protocol Overview", "Computer Networks", "TCP and IP", "NOTES"},
                {"Subnetting Quick Reference", "Computer Networks", "IP Addressing", "PDF"},
                {"Computer Networks Examination 2025", "Computer Networks", "Network Layers", "PYQ"}
        };
        for (int index = 0; index < data.length; index++) {
            String[] item = data[index];
            StudyMaterial material = new StudyMaterial();
            material.setTitle(item[0]);
            material.setDescription("Study guide covering " + item[2] + " with definitions, examples, and review prompts.");
            material.setSubject(catalog.stream().filter(subject -> subject.getName().equals(item[1])).findFirst().orElseThrow());
            material.setTopic(item[2]);
            material.setSemester(4);
            material.setResourceType(item[3]);
            material.setDifficulty(index % 3 == 0 ? "BEGINNER" : index % 3 == 1 ? "INTERMEDIATE" : "ADVANCED");
            material.setFileUrl("https://example.com/edumind/demo/" + (index + 1));
            material.setUploadedBy(admin);
            materials.save(material);
        }
    }

    private void seedQuizzes(List<Subject> catalog, User admin) {
        String[][][] quizData = {
                {
                        {"Which database key uniquely identifies each row in a table?", "Primary key", "Keys"},
                        {"What does a foreign key reference?", "A key in another table", "Relationships"},
                        {"What is a primary goal of normalization?", "Reduce redundant data", "Normalization"},
                        {"Which ACID property makes a transaction all-or-nothing?", "Atomicity", "Transactions"},
                        {"What database structure can speed up lookups?", "Index", "Indexing"},
                        {"What does an INNER JOIN return?", "Rows with matching values in both tables", "SQL Joins"}
                },
                {
                        {"Which data structure follows last-in, first-out order?", "Stack", "Stacks"},
                        {"Which data structure follows first-in, first-out order?", "Queue", "Queues"},
                        {"What ordering property defines a binary search tree?", "Left values are smaller and right values are larger", "Trees"},
                        {"What is the average lookup time for a hash table?", "O(1)", "Hashing"},
                        {"What does a linked-list node store besides its value?", "A reference to another node", "Linked Lists"},
                        {"Which structure returns the highest-priority item first?", "Priority queue", "Heaps"}
                },
                {
                        {"What input condition does binary search require?", "The input is sorted", "Searching"},
                        {"What is merge sort's time complexity?", "O(n log n)", "Sorting"},
                        {"Which data structure is commonly used by breadth-first search?", "Queue", "Graph Traversal"},
                        {"Which data structure is commonly used by depth-first search?", "Stack", "Graph Traversal"},
                        {"What edge constraint does Dijkstra's algorithm require?", "Non-negative edge weights", "Shortest Paths"},
                        {"What does dynamic programming reuse?", "Solutions to overlapping subproblems", "Dynamic Programming"}
                },
                {
                        {"What does the Java Runtime Environment provide?", "Libraries and a runtime for Java programs", "JVM"},
                        {"What does an interface primarily define?", "A contract of operations", "Interfaces"},
                        {"What executes Java bytecode?", "Java Virtual Machine", "JVM"},
                        {"Which principle hides internal state behind methods?", "Encapsulation", "Object-Oriented Design"},
                        {"When must a checked exception be handled or declared?", "At compile time", "Exceptions"},
                        {"Which Java collection is a resizable indexed list?", "ArrayList", "Collections"}
                },
                {
                        {"What is a process?", "A program in execution", "Processes"},
                        {"What do threads in one process typically share?", "Process resources and address space", "Threads"},
                        {"Which condition is one of the four deadlock requirements?", "Circular wait", "Deadlocks"},
                        {"What does paging divide virtual memory into?", "Fixed-size pages", "Memory Management"},
                        {"What does a scheduler decide?", "Which ready process runs next", "Scheduling"},
                        {"What synchronization primitive controls access with a counter?", "Semaphore", "Synchronization"}
                },
                {
                        {"What does TCP provide to applications?", "Reliable, ordered byte delivery", "TCP"},
                        {"What does DNS resolve?", "Domain names to IP addresses", "DNS"},
                        {"At which OSI layer does transport operate?", "Layer 4", "OSI Model"},
                        {"What does an IP router primarily forward?", "Packets between networks", "Routing"},
                        {"At which layer does HTTP operate?", "Application layer", "Application Protocols"},
                        {"What does a subnet mask identify?", "Network and host portions of an address", "IP Addressing"}
                }
        };
        String[] quizTitles = {"DBMS Foundations", "Data Structures Essentials", "Algorithms and Problem Solving", "Java Core Concepts", "Operating Systems and Networks"};
        int[] subjectIndices = {0, 1, 2, 3, 4};
        for (int quizIndex = 0; quizIndex < subjectIndices.length; quizIndex++) {
            Quiz quiz = new Quiz();
            quiz.setTitle(quizTitles[quizIndex]);
            quiz.setDescription("Six-question knowledge check with immediate topic-level feedback.");
            quiz.setSubject(catalog.get(subjectIndices[quizIndex]));
            quiz.setCreatedBy(admin);
            List<Question> quizQuestions = new ArrayList<>();
            String[][] data = quizData[quizIndex];
            for (int index = 0; index < data.length; index++) {
                List<String> options = new ArrayList<>();
                options.add(data[index][1]);
                for (int offset = 1; options.size() < 4; offset++) {
                    String candidate = data[(index + offset) % data.length][1];
                    if (!options.contains(candidate)) options.add(candidate);
                }
                int correctPosition = (index + quizIndex) % 4;
                String answer = options.remove(0);
                options.add(correctPosition, answer);
                Question question = new Question();
                question.setQuiz(quiz);
                question.setPrompt(data[index][0]);
                question.setOptionA(options.get(0));
                question.setOptionB(options.get(1));
                question.setOptionC(options.get(2));
                question.setOptionD(options.get(3));
                question.setCorrectOption(String.valueOf((char) ('A' + correctPosition)));
                question.setTopic(data[index][2]);
                question.setPoints(1);
                quizQuestions.add(question);
            }
            quiz.setQuestions(quizQuestions);
            quizzes.save(quiz);
        }
    }

    private void seedFlashcards(List<Subject> catalog) {
        String[][] topics = {
                {"Primary key", "Foreign key", "Normalization", "ACID properties"},
                {"Stack", "Queue", "Binary search tree", "Hash table"},
                {"Binary search", "Merge sort", "Breadth-first search", "Dynamic programming"},
                {"Encapsulation", "Inheritance", "Interface", "Exception handling"},
                {"Process", "Thread", "Virtual memory", "Deadlock"},
                {"TCP", "DNS", "IP address", "Router"}
        };
        for (int subjectIndex = 0; subjectIndex < topics.length; subjectIndex++) {
            for (String topic : topics[subjectIndex]) {
                Flashcard card = new Flashcard();
                card.setQuestion("Define " + topic + ".");
                card.setAnswer("" + topic + " is a core " + catalog.get(subjectIndex).getName() + " concept. Explain its purpose, key properties, and a practical example.");
                card.setSubject(catalog.get(subjectIndex));
                card.setTopic(topic);
                card.setDifficulty("INTERMEDIATE");
                flashcards.save(card);
            }
        }
    }
}